import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Donor } from './entities/donor.entity';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto, UpdatePasswordDto } from './dto/update-donor.dto';
import * as bcrypt from 'bcrypt';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { DonorStatus } from 'src/common/enums/donor-status.enum';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Injectable()
export class DonorService {
  constructor(
    @InjectRepository(Donor)
    private donorRepository: Repository<Donor>,
  ) {}

  async create(createDonorDto: CreateDonorDto): Promise<Donor> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createDonorDto.password, salt);
    const donor = this.donorRepository.create({ ...createDonorDto, password: hashedPassword });
    return this.donorRepository.save(donor);
  }

  async findAll(filterDto: FilterDonorDto): Promise<Donor[]> {
    const { bloodGroup, status, name } = filterDto;
    const where: any = {};

    if (bloodGroup) where.bloodGroup = bloodGroup;
    if (status) where.status = status;
    if (name) where.name = ILike(`%${name}%`);

    return this.donorRepository.find({ where });
  }

  async findOne(id: string): Promise<Donor | null> {
    // Convert string to number if your ID is numeric, or ensure your entity uses string ID
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return null;
    }
    const donor = await this.donorRepository.findOne({ where: { id: numericId } });
    return donor ?? null;
  }

  async findByEmail(email: string): Promise<Donor | null> {
    const donor = await this.donorRepository.findOne({ where: { email } });
    return donor ?? null;
  }

  async update(id: string, updateDonor: UpdateDonorDto): Promise<Donor | null> {
    const donor = await this.findOne(id);
    if (!donor) return null;

    // Check if the password exists and update it if provided
    if (updateDonor.password) {
      const salt = await bcrypt.genSalt();
      updateDonor.password = await bcrypt.hash(updateDonor.password, salt);
    }

    Object.assign(donor, updateDonor);
    return this.donorRepository.save(donor);
  }

  // Update the DonorService method
  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<boolean> {
    const donor = await this.findOne(id);
    if (!donor) return false;
    
    // No longer verifying the old password
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, salt);
    
    donor.password = hashedPassword;
    await this.donorRepository.save(donor);
    return true;
  }

  async remove(id: string): Promise<boolean> {
    const donor = await this.findOne(id);
    if (!donor) return false;
    
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return false;
    }
    
    await this.donorRepository.delete(numericId);
    return true;
  }

  // New method for account deletion with password verification
  async deleteAccount(id: string, deleteAccountDto: DeleteAccountDto): Promise<boolean> {
    const donor = await this.findOne(id);
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }
    
    // Check if password exists
    if (!donor.password) {
      throw new UnauthorizedException('Password verification failed');
    }
    
    // Verify password before proceeding with deletion
    const isPasswordValid = await bcrypt.compare(deleteAccountDto.password, donor.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return false;
    }
    
    // Proceed with account deletion
    const result = await this.donorRepository.delete(numericId);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  // Existing methods...
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
        
        // Skip blood type filtering if "ALL" is specified
        if (bloodType !== 'ALL' && donor.bloodGroup !== bloodType) return false;

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

  calculateDistanceKm(latitude: number, longitude: number, latitude1: number, longitude1: number): number {
    // Implementation for the Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(latitude1 - latitude);
    const dLon = this.deg2rad(longitude1 - longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(latitude)) * Math.cos(this.deg2rad(latitude1)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  // Helper function for the Haversine formula
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getBloodGroupInsufficientDonors(bloodGroup: string): Promise<Donor[]> {
    return this.donorRepository.find({
      where: {
        bloodGroup,
        status: DonorStatus.ACTIVE,
      },
    });
  }

  async updateStatus(id: string, status: DonorStatus): Promise<Donor | null> {
    const donor = await this.findOne(id);
    if (!donor) return null;

    donor.status = status;
    return this.donorRepository.save(donor);
  }
}