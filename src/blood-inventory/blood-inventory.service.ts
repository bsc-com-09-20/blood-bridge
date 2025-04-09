// src/blood-inventory/blood-inventory.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodInventory } from './entities/blood-inventory.entity';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';
import { UpdateBloodInventoryDto } from './dto/update-blood-inventory.dto';

@Injectable()
export class BloodInventoryService {
  constructor(
    @InjectRepository(BloodInventory)
    private bloodInventoryRepository: Repository<BloodInventory>,
  ) {}

  private calculateStatus(units: number): string {
    if (units > 5) return 'Sufficient';
    if (units > 2) return 'Near Critical';
    return 'Critical Shortage';
  }

  async create(createDto: CreateBloodInventoryDto): Promise<BloodInventory> {
    const status = this.calculateStatus(createDto.availableUnits);
    const inventory = this.bloodInventoryRepository.create({
      ...createDto,
      status,
    });
    return await this.bloodInventoryRepository.save(inventory);
  }

  async findAll(): Promise<BloodInventory[]> {
    return await this.bloodInventoryRepository.find();
  }

  async findOne(id: number): Promise<BloodInventory> {
    const inventory = await this.bloodInventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Blood inventory with ID ${id} not found`);
    }
    return inventory;
  }

  async update(id: number, updateDto: UpdateBloodInventoryDto): Promise<BloodInventory> {
    const inventory = await this.bloodInventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Blood inventory with ID ${id} not found`);
    }

    const updatedUnits = updateDto.availableUnits ?? inventory.availableUnits;
    const newStatus = this.calculateStatus(updatedUnits);

    Object.assign(inventory, {
      ...updateDto,
      status: newStatus,
    });

    return await this.bloodInventoryRepository.save(inventory);
  }

  async remove(id: number): Promise<void> {
    const inventory = await this.bloodInventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Blood inventory with ID ${id} not found`);
    }
    await this.bloodInventoryRepository.remove(inventory);
  }
}
