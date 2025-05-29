// blood-group.entity.ts
import { Donor } from 'src/donor/entities/donor.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('blood_group')
export class BloodGroup {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  bloodGroup: string; // e.g., A+, O-, AB+

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  canDonateTo: string;

  @Column({ type: 'text' })
  canReceiveFrom: string;
}