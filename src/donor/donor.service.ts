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

  // Hash password before saving the donor
  async create(createDonorDto: CreateDonorDto): Promise<Donor> {
    const hashedPassword = await bcrypt.hash(createDonorDto.password, 10); // Hash the password
    const newDonor = this.donorRepository.create({
      ...createDonorDto,
      password: hashedPassword, // Save hashed password
      lastDonation: createDonorDto.lastDonation ? new Date(createDonorDto.lastDonation) : undefined,
    });
    return await this.donorRepository.save(newDonor);
  }

  async findAll(filterDto: FilterDonorDto): Promise<Donor[]> {
    const query = this.donorRepository.createQueryBuilder('donor');

    if (filterDto.bloodGroup) {
      query.andWhere('donor.bloodGroup = :bloodGroup', { bloodGroup: filterDto.bloodGroup });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Donor | null> {
    return await this.donorRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<Donor | null> {
    return await this.donorRepository.findOneBy({ email });
  }

  // Update Donor's password or other data
  async update(id: string, updateDonorDto: UpdateDonorDto): Promise<Donor> {
    const donor = await this.donorRepository.findOneBy({ id });
  
    // If no donor is found, throw NotFoundException
    if (!donor) {
      throw new NotFoundException(`Donor with ID ${id} not found`);
    }

    // If password is being updated, hash it first
    if (updateDonorDto.password) {
      const hashedPassword = await bcrypt.hash(updateDonorDto.password, 10);
      updateDonorDto.password = hashedPassword;
    }
  
    // Update the donor entity with new data
    Object.assign(donor, updateDonorDto);
  
    // Save the updated donor entity back to the database
    return this.donorRepository.save(donor); // This is where we persist the update
  }

  async remove(id: string): Promise<void> {
    await this.donorRepository.delete(id);
  }

  // ✅ Find nearby donors using PostGIS (PostgreSQL)
  async findNearbyDonors(latitude: number, longitude: number, radius: number, bloodGroup?: string): Promise<Donor[]> {
    const query = this.donorRepository
      .createQueryBuilder('donor')
      .where(`ST_DistanceSphere(
        ST_MakePoint(:lon, :lat),
        ST_MakePoint(donor.location->>'longitude', donor.location->>'latitude')
      ) <= :radius`, {
        lat: latitude,
        lon: longitude,
        radius: radius * 1000, // Convert km to meters
      });

    if (bloodGroup) {
      query.andWhere('donor.bloodGroup = :bloodGroup', { bloodGroup });
    }

    return await query.getMany();
  }

  // ✅ Check blood group insufficiency
  async getBloodGroupInsufficientDonors(bloodGroup: string) {
    const minDonorsRequired = 5; // Minimum threshold
    const compatibleGroups = this.getCompatibleBloodGroups(bloodGroup);
    
    const totalDonors = await this.donorRepository.count({ where: { bloodGroup } });

    return {
      requiredBloodGroup: bloodGroup,
      compatibleBloodGroups: compatibleGroups,
      totalDonors,
      insufficientDonors: totalDonors < minDonorsRequired ? minDonorsRequired - totalDonors : 0,
    };
  }

  // ✅ Blood compatibility mapping
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
