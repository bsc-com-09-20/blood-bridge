// blood-request.service.ts (Fixed)
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

      const requestBloodType = bloodType === 'ALL' 
        ? (donor.bloodGroup as BloodType) 
        : bloodType as BloodType;

      return this.bloodRequestRepository.create({
        hospitalId: hospital.id,
        donorId: String(donor.id), // Convert to string
        bloodType: requestBloodType,
        quantity,
        distanceKm: distance,
        status: 'PENDING',
      });
    });

    const savedRequests = await this.bloodRequestRepository.save(requests);

    try {
      if (bloodType === 'ALL') {
        for (const request of savedRequests) {
          const donor = await this.donorService.findOne(request.donorId);
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
      const donor = await this.donorService.findOne(request.donorId);
      if (!donor?.phone) {
        this.logger.warn(`Skipping notification for donor ${request.donorId}: no phone number`);
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
        `Notification failed for donor ${request.donorId}: ${error.message}`,
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
      where: { hospitalId },
      relations: {
        donor: true,
        hospital: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
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
      const donor = await this.donorService.findOne(request.donorId);
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

  async respondToRequest(id: string, donorId: string) {
    const request = await this.findOne(id);
    
    if (request.donorId !== donorId) {
      throw new NotFoundException('Blood request not found or not assigned to you');
    }
    
    if (request.status !== 'ACTIVE' && request.status !== 'PENDING') {
      throw new Error(`Cannot respond to request with status: ${request.status}`);
    }
    
    await this.bloodRequestRepository.update(id, { 
      status: 'FULFILLED',
      fulfilledAt: new Date(),
    });
    
    try {
      if (request.hospital) {
        const hospital = await this.hospitalService.findOne(request.hospitalId);
        const donor = await this.donorService.findOne(request.donorId);
        
        if (hospital && donor) {
          // Check if hospital has email or contact number
          const hospitalContactInfo = hospital.email || (hospital as any).contactNumber || '';
          
          if (hospitalContactInfo) {
            const donorName = donor.name || donor.id;
            
            await this.notificationService.sendSms(
              hospitalContactInfo,
              `A donor (${donorName}) has responded to your blood request for ${request.bloodType}. Request ID: ${request.id}`,
            );
          } else {
            this.logger.warn(`No contact information available for hospital ${hospital.id}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Hospital notification failed for request ${id}: ${error.message}`,
        error.stack,
      );
    }
    
    return { success: true };
  }

  async getRequestsByDonor(donorId: string) {
    return this.bloodRequestRepository.find({
      where: { donorId },
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
    const R = 6371;
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