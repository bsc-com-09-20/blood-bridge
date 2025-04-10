/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Donor } from './entities/donor.entity';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { Point } from 'geojson';

@Injectable()
export class DonorService {
  constructor(
    @InjectRepository(Donor)
    private readonly donorRepository: Repository<Donor>,
  ) {}

  async create(createDonorDto: CreateDonorDto): Promise<Donor> {
    const hashedPassword = await bcrypt.hash(createDonorDto.password, 10);

    // Create GeoJSON Point object for PostGIS
    const location = createDonorDto.latitude && createDonorDto.longitude
      ? {
          type: 'Point',
          coordinates: [createDonorDto.longitude, createDonorDto.latitude] // PostGIS uses [lng, lat] order
        } as Point
      : undefined;

    const newDonor = this.donorRepository.create({
      ...createDonorDto,
      password: hashedPassword,
      location,
      lastDonation: createDonorDto.lastDonation
        ? new Date(createDonorDto.lastDonation)
        : undefined,
    });

    return await this.donorRepository.save(newDonor);
  }

  async findAll(filterDto: FilterDonorDto): Promise<Donor[]> {
    const query = this.donorRepository.createQueryBuilder('donor');

    if (filterDto.bloodGroup) {
      query.andWhere('donor.bloodGroup = :bloodGroup', {
        bloodGroup: filterDto.bloodGroup,
      });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Donor | null> {
    return await this.donorRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<Donor | null> {
    return await this.donorRepository.findOneBy({ email });
  }

  async update(id: string, updateDonorDto: UpdateDonorDto): Promise<Donor> {
    const donor = await this.donorRepository.findOneBy({ id });

    if (!donor) {
      throw new NotFoundException(`Donor with ID ${id} not found`);
    }

    if (updateDonorDto.password) {
      updateDonorDto.password = await bcrypt.hash(updateDonorDto.password, 10);
    }

    // Handle location update
    if (
      updateDonorDto.latitude !== undefined &&
      updateDonorDto.longitude !== undefined
    ) {
      donor.location = {
        type: 'Point',
        coordinates: [updateDonorDto.longitude, updateDonorDto.latitude]
      } as Point;
    }

    // Remove latitude and longitude from the DTO before using Object.assign
    // These properties likely don't exist on the Donor entity directly
    const { latitude, longitude, ...updateData } = updateDonorDto;
    
    Object.assign(donor, updateData);

    return this.donorRepository.save(donor);
  }

  async remove(id: string): Promise<void> {
    await this.donorRepository.delete(id);
  }
  
  // ✅ Find nearby donors using PostGIS and return lat/lng extracted
async findNearbyDonors(
  latitude: number,
  longitude: number,
  radiusKm: number,
  bloodType: string,
): Promise<(Donor & { lat: number; lng: number })[]> {
  const query = this.donorRepository
    .createQueryBuilder('donor')
    .addSelect(`ST_Y(donor.location)`, 'lat')
    .addSelect(`ST_X(donor.location)`, 'lng')
    .where(
      `ST_DWithin(
        donor.location,
        ST_MakePoint(:lng, :lat)::geography,
        :radius
      )`,
      {
        lng: longitude,
        lat: latitude,
        radius: radiusKm * 1000,
      },
    );

   // Only add the blood group filter if bloodType is provided
   if (bloodType) {
    query.andWhere('donor.bloodGroup = :bloodGroup', { bloodGroup: bloodType });
  }

  const raw = await query.getRawAndEntities();

  // Map entities to include the extracted lat/lng values
  return raw.entities.map((donor, i) => ({
    ...donor,
    lat: parseFloat(raw.raw[i].lat),
    lng: parseFloat(raw.raw[i].lng),
  }));
}


async getBloodGroupInsufficientDonors(bloodGroup: string) {
  // Implementation depends on your business logic
  // Example implementation:
  const threshold = 5; // Define what "insufficient" means (e.g., less than 5 donors)
  
  const count = await this.donorRepository.count({
    where: { bloodGroup }
  });
  
  return {
    bloodGroup,
    count,
    isInsufficient: count < threshold
  };
}
  

  // Compatibility function for blood groups
  private getCompatibleBloodGroups(bloodGroup: string): string[] {
    const compatibility = {
      'O-': ['O-'],
      'O+': ['O-', 'O+'],
      'A-': ['O-', 'A-'],
      'A+': ['O-', 'O+', 'A-', 'A+'],
      'B-': ['O-', 'B-'],
      'B+': ['O-', 'O+', 'B-', 'B+'],
      'AB-': ['O-', 'A-', 'B-', 'AB-'],
      'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    };
    return compatibility[bloodGroup] || [];
  }
}