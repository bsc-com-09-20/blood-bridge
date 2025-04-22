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
    hospitalId: string,
    bloodType: BloodType | 'ALL',
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
        donor.latitude,
        donor.longitude,
      );

      // Use the donor's actual blood type instead of "ALL"
      // Cast to BloodType enum to ensure type safety
      const requestBloodType = bloodType === 'ALL' 
        ? (donor.bloodGroup as BloodType) 
        : bloodType as BloodType;

      // Use proper relations syntax for TypeORM
      return this.bloodRequestRepository.create({
        hospital: { id: hospital.id },
        donor: { id: donor.id },
        bloodType: requestBloodType,
        quantity,
        distanceKm: distance,
        status: 'PENDING',
      });
    });

    const savedRequests = await this.bloodRequestRepository.save(requests);

    try {
      // For broadcast requests, we need to handle notifications with each donor's blood type
      if (bloodType === 'ALL') {
        for (const request of savedRequests) {
          const donor = await this.donorService.findOne(request.donor.id);
          if (donor?.bloodGroup) {
            await this.notifyDonor(
              request, 
              hospital.name, 
              donor.bloodGroup as BloodType
            );
          }
        }
      } else {
        await this.notifyDonors(savedRequests, hospital.name, bloodType as BloodType);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send notifications for hospital ${hospitalId}: ${error.message}`,
        error.stack,
      );
    }

    return savedRequests;
  }

  private async notifyDonor(
    request: BloodRequest,
    hospitalName: string,
    bloodType: BloodType,
  ) {
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
        status: 'ACTIVE', 
      });

      this.logger.log(`Notification sent to donor ${donor.id}`);
    } catch (error) {
      this.logger.error(
        `Notification failed for donor ${request.donor.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  private async notifyDonors(
    requests: BloodRequest[], 
    hospitalName: string, 
    bloodType: BloodType,
  ) {
    const notificationPromises = requests.map(request => 
      this.notifyDonor(request, hospitalName, bloodType)
    );

    await Promise.all(notificationPromises);
  }

  async getRequestsByHospital(hospitalId: string) {
    return this.bloodRequestRepository.find({
      where: { hospital: { id: hospitalId} },
      relations: {
        donor: true,
        hospital: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id:string ) {
    const request = await this.bloodRequestRepository.findOne({
      where: { id },
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

  async cancelRequest(id: string) {
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

  async respondToRequest(id: string) {
    const request = await this.findOne(id);
    
    if (request.status !== 'ACTIVE' && request.status !== 'PENDING') {
      throw new Error(`Cannot respond to request with status: ${request.status}`);
    }
    
    // Update the request status
    await this.bloodRequestRepository.update(id, { 
      status: 'FULFILLED',
      // Use separate fulfilledAt field instead of respondedAt
      fulfilledAt: new Date(),
    });
    
    try {
      // Notify the hospital that a donor has responded
      if (request.hospital) {
        const hospital = await this.hospitalService.findOne(request.hospital.id);
        const donor = await this.donorService.findOne(request.donor.id);
        
        if (hospital && donor && donor.phone) {
          // Use notification service to notify hospital
          // Check if hospital has a contact method available
          const hospitalContactInfo = hospital.email || '';
          
          if (hospitalContactInfo) {
            // Create a notification message without assuming specific fields
            const donorName = donor.name || donor.id; // Use name if available, otherwise ID
            
            await this.notificationService.sendSms(
              hospitalContactInfo,
              `A donor has responded to your blood request for ${request.bloodType}. Request ID: ${request.id}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Hospital notification failed for request ${id}: ${error.message}`,
        error.stack,
      );
      // Don't throw here - we still want to mark as fulfilled even if notification fails
    }
    
    return { success: true };
  }


  // Add a method to get requests for a specific donor
  async getRequestsByDonor(donorId: string) {
    return this.bloodRequestRepository.find({
      where: { donor: { id: donorId} },
      relations: {
        donor: true,
        hospital: true,
      },
      order: { createdAt: 'DESC' },
    });
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