// blood-request.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Donor } from '../../donor/entities/donor.entity';
import { Hospital } from '../../hospital/entities/hospital.entity';
import { BloodType } from '../../common/enums/blood-type.enum';

@Entity('blood_requests')
export class BloodRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Hospital)
  @JoinColumn({ name: 'hospitalId' })
  hospital: Hospital;

  @Column({ type: 'varchar' })
  hospitalId: string;

  @ManyToOne(() => Donor)
  @JoinColumn({ name: 'donorId' })
  donor: Donor;

  @Column({ type: 'varchar' })
  donorId: string;

  @Column({
    type: 'enum',
    enum: BloodType
  })
  bloodType: BloodType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  distanceKm: number;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACTIVE', 'FULFILLED', 'CANCELLED'],
    default: 'PENDING'
  })
  status: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
  notificationSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  notificationSentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  fulfilledAt: Date;
}