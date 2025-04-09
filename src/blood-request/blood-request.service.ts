import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodRequest } from './entities/blood-request.entity';
import { DonorService } from '../donor/donor.service';
import { HospitalService } from '../hospital/hospital.service';
import { NotificationService } from '../notification/notification.service';
import { BloodType } from '../common/enums/blood-type.enum';

@Injectable()
export class BloodRequestService {
  private readonly logger = new Logger(BloodRequestService.name);

  constructor(
    @InjectRepository(BloodRequest)
    private readonly bloodRequestRepository: Repository<BloodRequest>,
    private readonly hospitalService: HospitalService,
    private readonly donorService: DonorService,
    private readonly notificationService: NotificationService,
  ) {}

  async createRequest(
    hospitalId: number,
    bloodType: BloodType,
    quantity: number,
    radius: number,
  ) {
    const hospital = await this.hospitalService.findOne(hospitalId);
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${hospitalId} not found`);
    }

    const donors = await this.donorService.findNearbyDonors(
      hospital.latitude,
      hospital.longitude,
      radius,
      bloodType,
    );

    if (!donors.length) {
      this.logger.warn(`No donors found within ${radius}km for blood type ${bloodType}`);
      return [];
    }

    const requests = donors.map(donor => {
      const distance = this.calculateDistance(
        hospital.latitude,
        hospital.longitude,
        donor.lat,
        donor.lng,
      );

      return this.bloodRequestRepository.create({
        hospital: { id: hospital.id },
        donor: { id: donor.id },
        bloodType,
        quantity,
        distanceKm: distance,
        status: 'PENDING',
      });
    });

    const savedRequests = await this.bloodRequestRepository.save(requests);

    try {
      await this.notifyDonors(savedRequests, hospital.name, bloodType);
    } catch (error) {
      this.logger.error(
        `Failed to send notifications for hospital ${hospitalId}: ${error.message}`,
        error.stack,
      );
    }

    return savedRequests;
  }

  private async notifyDonors(
    requests: BloodRequest[], 
    hospitalName: string, 
    bloodType: BloodType,
  ) {
    const notificationPromises = requests.map(async (request) => {
      try {
        const donor = await this.donorService.findOne(request.donor.id);
        if (!donor?.phone) {
          this.logger.warn(`Skipping notification for donor ${request.donor.id}: no phone number`);
          return;
        }

        await this.notificationService.sendBloodRequestSms(
          donor.phone,
          hospitalName,
          bloodType,
        );

        await this.bloodRequestRepository.update(request.id, {
          notificationSent: true,
          notificationSentAt: new Date(),
        });

        this.logger.log(`Notification sent to donor ${donor.id}`);
      } catch (error) {
        this.logger.error(
          `Notification failed for donor ${request.donor.id}: ${error.message}`,
          error.stack,
        );
      }
    });

    await Promise.all(notificationPromises);
  }

  async getRequestsByHospital(hospitalId: number) {
    return this.bloodRequestRepository.find({
      where: { hospital: { id: hospitalId } },
      relations: {
        donor: true,
        hospital: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const request = await this.bloodRequestRepository.findOne({
      where: { id: id.toString()  },
      relations: {
        donor: true,
        hospital: true,
      },
    });
    
    if (!request) {
      throw new NotFoundException(`Blood request with ID ${id} not found`);
    }
    
    return request;
  }

  async cancelRequest(id: number) {
    const request = await this.findOne(id);
    
    await this.bloodRequestRepository.update(id, { 
      status: 'CANCELLED',
      cancelledAt: new Date(),
    });
    
    try {
      const donor = await this.donorService.findOne(request.donor.id);
      if (donor?.phone && request.hospital) {
        await this.notificationService.sendSms(
          donor.phone,
          `The blood request from ${request.hospital.name} for ${request.bloodType} has been cancelled.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Cancellation notification failed for request ${id}: ${error.message}`,
        error.stack,
      );
    }
    
    return { success: true };
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}