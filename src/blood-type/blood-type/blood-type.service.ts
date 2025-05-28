import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodGroup } from './entities/blood-group.entity';
import { CreateBloodGroupDto } from './dto/create-blood_group.dto';
import { UpdateBloodGroupDto } from './dto/update-blood-group.dto';

@Injectable()
export class BloodGroupService {
  constructor(
    @InjectRepository(BloodGroup)
    private bloodGroupRepo: Repository<BloodGroup>,
  ) {}

  async create(dto: CreateBloodGroupDto): Promise<BloodGroup> {
    const bloodGroup = this.bloodGroupRepo.create(dto);
    return this.bloodGroupRepo.save(bloodGroup);
  }

  async findAll(): Promise<BloodGroup[]> {
    return this.bloodGroupRepo.find();
  }

  async findOne(id: number): Promise<BloodGroup> {
    const bg = await this.bloodGroupRepo.findOneBy({ id });
    if (!bg) throw new NotFoundException('Blood group not found');
    return bg;
  }

  async findByGroup(bloodGroup: string): Promise<BloodGroup> {
    const bg = await this.bloodGroupRepo.findOneBy({ bloodGroup });
    if (!bg) throw new NotFoundException('Blood group not found');
    return bg;
  }

  async update(id: number, dto: UpdateBloodGroupDto): Promise<BloodGroup> {
    const bloodGroup = await this.findOne(id);
    Object.assign(bloodGroup, dto);
    return this.bloodGroupRepo.save(bloodGroup);
  }

  async remove(id: number): Promise<void> {
    await this.bloodGroupRepo.delete(id);
  }
}