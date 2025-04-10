// blood-group.entity.ts
import { Donor } from 'src/donor/entities/donor.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('blood_group')
export class BloodGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  bloodGroup: string; // e.g., A+, O-, AB+

  @Column('text')
  description: string;

  @Column('text')
  canDonateTo: string;

  @Column('text')
  canReceiveFrom: string;
}
