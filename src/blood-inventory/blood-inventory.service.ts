// src/blood-inventory/blood-inventory.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodInventory } from './entities/blood-inventory.entity';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';

@Injectable()
export class BloodInventoryService {
  create(createBloodInventoryDto: CreateBloodInventoryDto) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(BloodInventory)
    private bloodInventoryRepository: Repository<BloodInventory>,
  ) {}

  async findAll(): Promise<BloodInventory[]> {
    return await this.bloodInventoryRepository.find();
  }

  async findOne(id: number): Promise<BloodInventory> {
    const inventory = await this.bloodInventoryRepository.findOne({
      where: { id: Number(id) },
    });
    if (!inventory) {
      throw new NotFoundException(`Blood inventory with ID ${id} not found`);
    }
    return inventory;
  }

  async update(id: number, data: Partial<BloodInventory>): Promise<BloodInventory> {
    const bloodInventory = await this.bloodInventoryRepository.findOne({
      where: { id: Number(id) },
    });

    if (!bloodInventory) {
      throw new NotFoundException(`Blood inventory with ID ${id} not found`);
    }

    Object.assign(bloodInventory, data);
    return await this.bloodInventoryRepository.save(bloodInventory);
  }

  async remove(id: number): Promise<void> {
    const bloodInventory = await this.bloodInventoryRepository.findOne({
      where: { id: Number(id) },
    });

    if (!bloodInventory) {
      throw new NotFoundException(`Blood inventory with ID ${id} not found`);
    }

    await this.bloodInventoryRepository.remove(bloodInventory);
  }
}
