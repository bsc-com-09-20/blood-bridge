// blood-type.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBloodTypeDto } from './dto/create-blood-type.dto';
import { UpdateBloodTypeDto } from './dto/update-blood-type.dto';
import { BloodType } from './entities/blood-type.entity';

@Injectable()
export class BloodTypeService {
  constructor(
    @InjectRepository(BloodType)
    private bloodTypeRepo: Repository<BloodType>,
  ) {}

  async create(dto: CreateBloodTypeDto): Promise<BloodType> {
    const bloodType = this.bloodTypeRepo.create(dto);
    return this.bloodTypeRepo.save(bloodType);
  }

  async findAll(): Promise<BloodType[]> {
    return this.bloodTypeRepo.find();
  }

  async findOne(id: string): Promise<BloodType> {
    const bt = await this.bloodTypeRepo.findOneBy({ id });
    if (!bt) throw new NotFoundException('Blood type not found');
    return bt;
  }

  async update(id: string, dto: UpdateBloodTypeDto): Promise<BloodType> {
    const bloodType = await this.findOne(id);
    Object.assign(bloodType, dto);
    return this.bloodTypeRepo.save(bloodType);
  }

  async remove(id: string): Promise<void> {
    await this.bloodTypeRepo.delete(id);
  }
}
