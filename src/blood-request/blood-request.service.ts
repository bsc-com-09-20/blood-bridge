import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BloodRequest } from './entities/blood-request.entity';
import { Donor } from '../donor/entities/donor.entity';
import { Hospital } from '../hospital/entities/hospital.entity';
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
    return this.requestDonorsByDistance(
      hospitalId,
      bloodType,
      radius,
      false,
      quantity
    );
  }

  async requestDonorsByDistance(
    hospitalId: number,
    requestedBloodType: BloodType | null,
    maxDistanceKm: number,
    broadcastAll: boolean = false,
    quantity: number = 1
  ) {
    const hospital = await this.hospitalService.findOne(hospitalId);
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${hospitalId} not found`);
    }

    // Find nearby donors (with or without blood type filter)
    let donors;
    if (broadcastAll) {
      donors = await this.donorService.findNearbyDonors(
        hospital.latitude,
        hospital.longitude,
        maxDistanceKm,
      );
    } else {
      donors = await this.donorService.findNearbyDonors(
        hospital.latitude,
        hospital.longitude,
        maxDistanceKm,
        requestedBloodType as BloodType,
      );
    }

    if (!donors.length) {
      this.logger.warn(`No donors found within ${maxDistanceKm}km`);
      return [];
    }

    // Create request records
    const requests = donors.map(donor => {
      const distance = this.calculateDistance(
        hospital.latitude,
        hospital.longitude,
        donor.lat,
        donor.lng,
      );

      const request = new BloodRequest();
      request.hospital = { id: hospital.id } as Hospital;
      request.donor = { id: donor.id } as Donor;
      request.bloodType = broadcastAll ? BloodType.ALL : (requestedBloodType as BloodType);
      request.quantity = quantity;
      request.distanceKm = distance;
      request.radius = maxDistanceKm;
      request.status = 'PENDING';

      return request;
    });

    const savedRequests = await this.bloodRequestRepository.save(requests);

    try {
      await this.notifyDonors(
        savedRequests, 
        hospital.name, 
        broadcastAll ? BloodType.ALL : (requestedBloodType as BloodType),
        maxDistanceKm
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notifications for hospital ${hospitalId}: ${error.message}`,
        error.stack,
      );
    }

    return savedRequests;
  }

  async getRequestsByHospital(hospitalId: number) {
    return this.bloodRequestRepository.find({
      where: { hospitalId },
      relations: ['donor', 'hospital'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRequestStatistics(hospitalId: number) {
    const [totalRequests, pendingRequests, activeRequests, fulfilledRequests] = await Promise.all([
      this.bloodRequestRepository.count({ where: { hospitalId } }),
      this.bloodRequestRepository.count({ where: { hospitalId, status: 'PENDING' } }),
      this.bloodRequestRepository.count({ where: { hospitalId, status: 'ACTIVE' } }),
      this.bloodRequestRepository.count({ where: { hospitalId, status: 'FULFILLED' } }),
    ]);

    return {
      totalRequests,
      pendingRequests,
      activeRequests,
      fulfilledRequests,
      cancelledRequests: totalRequests - pendingRequests - activeRequests - fulfilledRequests,
    };
  }

  async cancelRequest(id: string) {
    const request = await this.bloodRequestRepository.findOne({
      where: { id },
      relations: ['hospital', 'donor'],
    });

    if (!request) {
      throw new NotFoundException(`Blood request with ID ${id} not found`);
    }

    await this.bloodRequestRepository.update(id, {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    });

    try {
      if (request.donor?.phone && request.hospital) {
        await this.notificationService.sendSms(
          request.donor.phone,
          `The blood request from ${request.hospital.name} for ${this.bloodTypeToString(request.bloodType)} has been cancelled.`,
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

  private async notifyDonors(
    requests: BloodRequest[], 
    hospitalName: string, 
    bloodType: BloodType,
    radius: number
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
          radius,
          request.distanceKm
        );

        await this.bloodRequestRepository.update(request.id, {
          notificationSent: true,
          notificationSentAt: new Date(),
          status: 'ACTIVE',
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
    
    // Update donors notified count for all requests
    await this.bloodRequestRepository.update(
      { id: In(requests.map(r => r.id)) },
      { donorsNotified: requests.length }
    );
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

  private bloodTypeToString(bloodType: BloodType): string {
    return bloodType === BloodType.ALL ? 'all blood types' : 
      bloodType.toLowerCase().replace('_', '+');
  }

  async findOne(id: string) {
    const request = await this.bloodRequestRepository.findOne({
      where: { id },
      relations: ['donor', 'hospital'],
    });
    
    if (!request) {
      throw new NotFoundException(`Blood request with ID ${id} not found`);
    }
    
    return request;
  }
}