// blood-type.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class BloodType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  type: string; // e.g., A+, O-, AB+

  @Column('text')
  description: string; // e.g., "Rare type, can be donated to..."
}
