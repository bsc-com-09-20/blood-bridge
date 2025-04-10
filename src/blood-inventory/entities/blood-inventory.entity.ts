// src/blood-inventory/entities/blood-inventory.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BloodInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bloodGroup: string;

  @Column()
  availableUnits: number;

  @Column()
  status: string;
}
