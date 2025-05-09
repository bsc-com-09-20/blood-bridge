import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Donor } from './entities/donor.entity';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto, UpdatePasswordDto } from './dto/update-donor.dto';
import * as bcrypt from 'bcrypt';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { DonorStatus } from 'src/common/enums/donor-status.enum';

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
    const donor = await this.donorRepository.findOne({ where: { id } });
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

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<boolean> {
    const donor = await this.findOne(id);
    if (!donor || !donor.password) return false;  // Ensure password is not null or undefined

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(updatePasswordDto.currentPassword, donor.password);
    if (!isMatch) return false;

    // Update the password if current password matches
    const salt = await bcrypt.genSalt();
    donor.password = await bcrypt.hash(updatePasswordDto.newPassword, salt);

    await this.donorRepository.save(donor);
    return true;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.donorRepository.delete(id);

    // Ensure result is valid and contains affected property
    return result && typeof result.affected === 'number' && result.affected > 0;
  }

  async findNearbyDonors(latitude: number, longitude: number, radius: number, bloodGroup: string): Promise<Donor[]> {
    // Implement real geo logic here if needed
    return [];
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
