/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Donor } from './entities/donor.entity';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { FilterDonorDto } from './dto/filter-donor.dto';

@Injectable()
export class DonorService {
  constructor(
    @InjectRepository(Donor)
    private readonly donorRepository: Repository<Donor>,
  ) {}

  async create(createDonorDto: CreateDonorDto): Promise<Donor> {
    const hashedPassword = await bcrypt.hash(createDonorDto.password, 10);

    const newDonor = this.donorRepository.create({
      ...createDonorDto,
      password: hashedPassword,
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

    Object.assign(donor, updateDonorDto);

    return this.donorRepository.save(donor);
  }

  async remove(id: string): Promise<void> {
    await this.donorRepository.delete(id);
  }

  // If you still want to find "nearby" donors based on raw lat/lng math (not using PostGIS)
  async findNearbyDonors(
    latitude: number,
    longitude: number,
    radiusKm: number,
    bloodType: string,
  ): Promise<(Donor & { distanceKm: number })[]> {
    const donors = await this.donorRepository.find();

    const filtered = donors
      .filter((donor) => {
        if (!donor.latitude || !donor.longitude) return false;
        if (bloodType && donor.bloodGroup !== bloodType) return false;

        const distance = this.calculateDistanceKm(
          latitude,
          longitude,
          donor.latitude,
          donor.longitude,
        );

        return distance <= radiusKm;
      })
      .map((donor) => ({
        ...donor,
        distanceKm: this.calculateDistanceKm(
          latitude,
          longitude,
          donor.latitude,
          donor.longitude,
        ),
      }));

    return filtered;
  }

  async getBloodGroupInsufficientDonors(bloodGroup: string) {
    const threshold = 5;

    const count = await this.donorRepository.count({
      where: { bloodGroup },
    });

    return {
      bloodGroup,
      count,
      isInsufficient: count < threshold,
    };
  }

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

  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}