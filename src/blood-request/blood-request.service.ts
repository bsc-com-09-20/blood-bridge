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
  private logger = new Logger('BloodRequestService');

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
    if (!hospital) throw new NotFoundException('Hospital not found');

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

    // Send notifications to all eligible donors
    try {
      await this.notifyDonors(savedRequests, hospital.name, bloodType);
    } catch (error) {
      this.logger.error(`Failed to send notifications: ${error.message}`);
      // We don't rethrow here to ensure the blood requests are still saved
      // even if notifications fail
    }

    return savedRequests;
  }

  // New method to handle donor notifications
  private async notifyDonors(
    requests: BloodRequest[], 
    hospitalName: string, 
    bloodType: BloodType
  ) {
    const notificationPromises = requests.map(async (request) => {
      try {
        // Get donor's phone number
        const donor = await this.donorService.findOne(request.donor.id);
        if (!donor || !donor.phoneNumber) {
          this.logger.warn(`Cannot notify donor #${request.donor.id}: no phone number found`);
          return;
        }

        // Send blood request SMS notification
        await this.notificationService.sendBloodRequestSms(
          donor.phoneNumber,
          hospitalName,
          bloodType
        );

        // Update the request to indicate notification was sent
        await this.bloodRequestRepository.update(request.id, {
          notificationSent: true,
          notificationSentAt: new Date()
        });

        this.logger.log(`Notification sent to donor #${donor.id} for blood type ${bloodType}`);
      } catch (error) {
        this.logger.error(`Failed to notify donor #${request.donor.id}: ${error.message}`);
        // We don't rethrow to allow other notifications to proceed
      }
    });

    // Wait for all notifications to be processed
    await Promise.all(notificationPromises);
  }

  // Haversine formula to calculate distance between two GPS coordinates
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2)); // Distance in km
  }
}