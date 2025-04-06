import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodRequest } from './entities/blood-request.entity';
import { DonorService } from '../donor/donor.service';
import { HospitalService } from '../hospital/hospital.service';
import { BloodType } from '../common/enums/blood-type.enum';

@Injectable()
export class BloodRequestService {
  constructor(
    @InjectRepository(BloodRequest)
    private bloodRequestRepository: Repository<BloodRequest>,

    private hospitalsService: HospitalService,
    private donorsService: DonorService,
  ) {}

  async createRequest(
    hospitalId: number,
    bloodType: BloodType,
    quantity: number,
    radius: number, // radius in km
  ) {
    const hospital = await this.hospitalsService.findOne(hospitalId);
    if (!hospital) throw new NotFoundException('Hospital not found');

    // Find nearby donors matching blood type
    const donors = await this.donorsService.findNearbyDonors(
      hospital.latitude,
      hospital.longitude,
      radius,
      bloodType,
    );

    if (!donors.length) {
      return []; // No donors found nearby
    }

    // Generate blood request entries
    const requests = donors.map((donor) => {
      // Use lat and lng properties from the findNearbyDonors result
      const distance = this.calculateDistance(
        hospital.latitude,
        hospital.longitude,
        donor.lat,  // Use lat instead of latitude
        donor.lng   // Use lng instead of longitude
      );

      return this.bloodRequestRepository.create({
        hospital: { id: hospital.id },
        donor: { id: donor.id }, // Use id instead of userId
        bloodType,
        quantity,
        distanceKm: distance,
      });
    });

    return this.bloodRequestRepository.save(requests);
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