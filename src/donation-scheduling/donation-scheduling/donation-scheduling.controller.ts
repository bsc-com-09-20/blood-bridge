import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DonationSchedulingService } from './donation-scheduling.service';
import { Request } from 'express';
import { CreateDonationScheduleDto } from '../dto/create-schedule-donation.dto';
import { DonationSchedule } from '../entities/donation.entity';
import { DateRangeDto } from '../dto/date-range.dto';
import { UpdateDonationScheduleDto } from '../dto/update-schedule-donation.dto';
import { AssignDonorDto } from '../dto/assigned-donor.dto';
import { Public } from 'src/auth/auth.guard';

interface RequestWithUser extends Request {
  user?: {
    id: number; // Changed from string to number
    hospitalId?: string;
    donorId?: number; // Changed from string to number
    role: string;
  };
}

@ApiTags('donation-scheduling')
@ApiBearerAuth()
@Public()
@Controller('donation-scheduling')
export class DonationSchedulingController {
  constructor(private readonly donationSchedulingService: DonationSchedulingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new donation schedule' })
  @ApiResponse({ status: 201, description: 'The donation schedule has been created', type: DonationSchedule })
  async create(@Body() createDto: CreateDonationScheduleDto, @Req() req: RequestWithUser): Promise<DonationSchedule> {
    // Use hospital ID from authenticated user
    if (req.user && req.user.hospitalId) {
      createDto.hospitalId = req.user.hospitalId;
    }
    
    // Verify hospitalId exists before proceeding
    if (!createDto.hospitalId) {
      throw new BadRequestException('Hospital ID is required');
    }
    
    return await this.donationSchedulingService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all donation schedules for the hospital' })
  @ApiResponse({ status: 200, description: 'Return all donation schedules', type: [DonationSchedule] })
  async findAll(@Req() req: RequestWithUser): Promise<DonationSchedule[]> {
    if (!req.user?.hospitalId) {
      throw new BadRequestException('Hospital ID is required');
    }
    return await this.donationSchedulingService.findByHospital(req.user.hospitalId);
  }

  @Get('upcoming')
  @Public()
  @ApiOperation({ summary: 'Get all upcoming donation schedules' })
  @ApiResponse({ status: 200, description: 'Return upcoming donation schedules', type: [DonationSchedule] })
  async findUpcoming(@Req() req: RequestWithUser): Promise<DonationSchedule[]> {
    // Get user information - could be hospital staff or donor
    const hospitalId = req.user?.hospitalId;
    const donorId = req.user?.donorId; // Now properly typed as number
    
    // Pass both IDs to the service, which will handle the logic
    return await this.donationSchedulingService.findUpcoming(hospitalId, donorId);
  }

  @Get('history')
  @Public()
  @ApiOperation({ summary: 'Get all past donation schedules' })
  @ApiResponse({ status: 200, description: 'Return past donation schedules', type: [DonationSchedule] })
  async findPast(@Req() req: RequestWithUser): Promise<DonationSchedule[]> {
    // Get user information - could be hospital staff or donor
    const hospitalId = req.user?.hospitalId;
    const donorId = req.user?.donorId; // Now properly typed as number
    
    return await this.donationSchedulingService.findPast(hospitalId, donorId);
  }

  @Public()
  @Get('date/:dateString')
  @ApiOperation({ summary: 'Get donation schedules for a specific date' })
  @ApiResponse({ status: 200, description: 'Return donation schedules for the date', type: [DonationSchedule] })
  async findByDate(
    @Param('dateString') dateString: string,
    @Req() req: RequestWithUser
  ): Promise<DonationSchedule[]> {
    const hospitalId = req.user?.hospitalId;
    const donorId = req.user?.donorId; // Now properly typed as number
    
    return await this.donationSchedulingService.findByDate(dateString, hospitalId, donorId);
  }

  @Post('date-range')
  @Public()
  @ApiOperation({ summary: 'Get donation schedules within a date range' })
  @ApiResponse({ status: 200, description: 'Return donation schedules within the date range', type: [DonationSchedule] })
  async findByDateRange(@Body() dateRangeDto: DateRangeDto, @Req() req: RequestWithUser): Promise<DonationSchedule[]> {
    // Set hospital ID from authenticated user if not provided and user exists
    if (!dateRangeDto.hospitalId && req.user?.hospitalId) {
      dateRangeDto.hospitalId = req.user.hospitalId;
    }
    
    // If user is a donor, pass the donor ID (now properly typed as number)
    const donorId = req.user?.donorId;
    
    return await this.donationSchedulingService.findByDateRange(dateRangeDto, donorId);
  }

  @Public()
  @Get('calendar/:year/:month')
  @ApiOperation({ summary: 'Get days with schedules for a specific month' })
  @ApiResponse({ status: 200, description: 'Return days with schedules', type: [Number] })
  async getDatesWithSchedules(
    @Param('year', ParseIntPipe) year: number, // Added ParseIntPipe
    @Param('month', ParseIntPipe) month: number, // Added ParseIntPipe
    @Req() req: RequestWithUser,
  ): Promise<number[]> {
    const hospitalId = req.user?.hospitalId;
    const donorId = req.user?.donorId; // Now properly typed as number
    
    return await this.donationSchedulingService.getDatesWithSchedules(
      year, // No need to convert to Number anymore
      month, // No need to convert to Number anymore
      hospitalId,
      donorId
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a donation schedule by id' })
  @ApiResponse({ status: 200, description: 'Return the donation schedule', type: DonationSchedule })
  @ApiResponse({ status: 404, description: 'Donation schedule not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DonationSchedule> {
    // FIXED: Now using ParseIntPipe to convert string to number
    return await this.donationSchedulingService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a donation schedule' })
  @ApiResponse({ status: 200, description: 'The donation schedule has been updated', type: DonationSchedule })
  @ApiResponse({ status: 404, description: 'Donation schedule not found' })
  async update(
    @Param('id', ParseIntPipe) id: number, // FIXED: Added ParseIntPipe
    @Body() updateDto: UpdateDonationScheduleDto,
  ): Promise<DonationSchedule> {
    return await this.donationSchedulingService.update(id, updateDto);
  }

  @Post('assign-donor')
  @Public()
  @ApiOperation({ summary: 'Assign a donor to a donation schedule' })
  @ApiResponse({ status: 200, description: 'The donor has been assigned', type: DonationSchedule })
  @ApiResponse({ status: 404, description: 'Donation schedule not found' })
  async assignDonor(
    @Body() assignDto: AssignDonorDto,
    @Req() req: RequestWithUser
  ): Promise<DonationSchedule> {
    // If user is authenticated as a donor, use their donor ID (now properly typed as number)
    if (req.user?.donorId && !assignDto.donorId) {
      assignDto.donorId = req.user.donorId;
    }
    
    return await this.donationSchedulingService.assignDonor(assignDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a donation schedule' })
  @ApiResponse({ status: 200, description: 'The donation schedule has been deleted' })
  @ApiResponse({ status: 404, description: 'Donation schedule not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // FIXED: Added ParseIntPipe to convert string to number
    return await this.donationSchedulingService.remove(id);
  }
}