import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-'
}

export enum InventoryStatus {
  SUFFICIENT = 'Sufficient',
  NEAR_CRITICAL = 'Near Critical',
  CRITICAL_SHORTAGE = 'Critical Shortage'
}

@Entity()
export class BloodInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BloodGroup,
    default: BloodGroup.O_POSITIVE
  })
  bloodGroup: BloodGroup;

  @Column({ type: 'int', default: 0 })
  availableUnits: number;

  @Column({
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.CRITICAL_SHORTAGE
  })
  status: InventoryStatus;
}