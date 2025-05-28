// donation-scheduling.service.ts - Fixed version
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThanOrEqual } from 'typeorm';
import { DonationSchedule } from '../entities/donation.entity';
import { CreateDonationScheduleDto } from '../dto/create-schedule-donation.dto';
import { DateRangeDto } from '../dto/date-range.dto';
import { UpdateDonationScheduleDto } from '../dto/update-schedule-donation.dto';
import { AssignDonorDto } from '../dto/assigned-donor.dto';

@Injectable()
export class DonationSchedulingService {
  constructor(
    @InjectRepository(DonationSchedule)
    private donationScheduleRepository: Repository<DonationSchedule>,
  ) {}

  async create(createDto: CreateDonationScheduleDto): Promise<DonationSchedule> {
    const schedule = this.donationScheduleRepository.create({
      ...createDto,
      scheduledDate: new Date(createDto.scheduleDate),
    });
    return await this.donationScheduleRepository.save(schedule);
  }

  async findAll(): Promise<DonationSchedule[]> {
    return await this.donationScheduleRepository.find({
      order: {
        scheduledDate: 'ASC',
      },
    });
  }

  async findByHospital(hospitalId: string): Promise<DonationSchedule[]> {
    return await this.donationScheduleRepository.find({
      where: { hospitalId },
      order: {
        scheduledDate: 'ASC',
      },
    });
  }

  // FIXED: Changed parameter from string to number
  async findById(id: number): Promise<DonationSchedule> {
    const schedule = await this.donationScheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Donation schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async findByDate(date: string, hospitalId?: string, donorId?: number): Promise<DonationSchedule[]> {
    const targetDate = new Date(date);
    // Set time to start of day
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const query: any = {
      scheduledDate: Between(targetDate, nextDay),
    };
    
    // Add hospitalId to query if provided
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }
    
    // Note: We don't filter by donorId here since donors should see all available schedules
    // You may want to implement additional logic if donors should only see certain schedules
    
    return await this.donationScheduleRepository.find({
      where: query,
      order: {
        critical: 'DESC', // Critical first
        scheduledDate: 'ASC',
      },
    });
  }

  async findByDateRange(dateRangeDto: DateRangeDto, donorId?: number): Promise<DonationSchedule[]> {
    const { startDate, endDate, hospitalId } = dateRangeDto;
    
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    // Validate dates
    if (startDateTime > endDateTime) {
      throw new BadRequestException('Start date must be before end date');
    }
    
    const query: any = {
      scheduledDate: Between(startDateTime, endDateTime),
    };
    
    // Add hospitalId to query if provided
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }
    
    // Note: Similar to findByDate, we don't filter by donorId here
    
    return await this.donationScheduleRepository.find({
      where: query,
      order: {
        scheduledDate: 'ASC',
      },
    });
  }

  async findUpcoming(hospitalId?: string, donorId?: number): Promise<DonationSchedule[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const query: any = {
      scheduledDate: MoreThanOrEqual(today),
    };
    
    // Add hospitalId to query if provided
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }
    
    // For donors, we show all upcoming public schedules
    // If you want to implement specific filtering for donors (e.g., by blood type),
    // you can add that logic here
    
    return await this.donationScheduleRepository.find({
      where: query,
      order: {
        scheduledDate: 'ASC',
        critical: 'DESC',
      },
    });
  }

  async findPast(hospitalId?: string, donorId?: number): Promise<DonationSchedule[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const query: any = {
      scheduledDate: LessThan(today),
    };
    
    // Add hospitalId to query if provided
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }
    
    // For donors, we show all past schedules
    // If you need donor-specific past donations, you'll need to add a relation
    // between donations and donors in your entity model
    
    return await this.donationScheduleRepository.find({
      where: query,
      order: {
        scheduledDate: 'DESC',
      },
    });
  }

  // FIXED: Changed parameter from string to number
  async update(id: number, updateDto: UpdateDonationScheduleDto): Promise<DonationSchedule> {
    const schedule = await this.findById(id);
    
    // Update scheduledDate properly if provided
    let updatedSchedule = { ...updateDto };
    if (updateDto.scheduledDate) {
      updatedSchedule.scheduledDate = new Date(updateDto.scheduledDate);
    }
    
    // Merge the found schedule with the update DTO
    const merged = this.donationScheduleRepository.merge(schedule, updatedSchedule);
    return await this.donationScheduleRepository.save(merged);
  }

  async assignDonor(assignDto: AssignDonorDto): Promise<DonationSchedule> {
    const { scheduleId, donorId } = assignDto;
    
    // FIXED: Parse scheduleId to number if it's coming as string
    const numericScheduleId = typeof scheduleId === 'string' ? parseInt(scheduleId, 10) : scheduleId;
    const schedule = await this.findById(numericScheduleId);
    
    // Validate that donorId is provided
    if (!donorId) {
      throw new BadRequestException('Donor ID is required to assign a donor');
    }
    
    // You might want to add logic here to check if this donor has already
    // been assigned to this schedule to prevent duplicates
    
    // Increment the donors assigned count
    schedule.donorsAssigned += 1;
    
    // Recalculate donors needed
    if (schedule.donorsNeeded > 0) {
      schedule.donorsNeeded -= 1;
    }
    
    // You may want to store the donorId in a relation or array on the schedule entity
    // This would require updating your entity model
    
    // Save the updated schedule
    return await this.donationScheduleRepository.save(schedule);
  }

  // FIXED: Changed parameter from string to number
  async remove(id: number): Promise<void> {
    const schedule = await this.findById(id);
    await this.donationScheduleRepository.remove(schedule);
  }
  
  async getDatesWithSchedules(year: number, month: number, hospitalId?: string, donorId?: number): Promise<number[]> {
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
    const endDate = new Date(year, month, 0); // Last day of the month
    
    const query: any = {
      scheduledDate: Between(startDate, endDate),
    };
    
    // Add hospitalId to query if provided
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }
    
    // Note: We don't filter by donorId here
    // Donors should see all available schedules for the calendar view
    
    const schedules = await this.donationScheduleRepository.find({
      where: query,
      select: ['scheduledDate'],
    });
    
    // Extract days from the dates and remove duplicates
    const daysWithSchedules = [...new Set(
      schedules.map(schedule => new Date(schedule.scheduledDate).getDate())
    )];
    
    return daysWithSchedules;
  }
}