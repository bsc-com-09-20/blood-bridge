import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Donor } from '../../donor/entities/donor.entity';
import { Hospital } from '../../hospital/entities/hospital.entity';
import { BloodType } from '../../common/enums/blood-type.enum';

@Entity()
export class BloodRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Hospital)
  @JoinColumn({ name: 'hospitalId' })
  hospital: Hospital;

  @Column()
  hospitalId: number;

  @ManyToOne(() => Donor)
  @JoinColumn({ name: 'donorId' })
  donor: Donor;

  @Column()
  donorId: string;

  @Column({
    type: 'enum',
    enum: BloodType,
    default: BloodType.ALL
  })
  bloodType: BloodType;

  @Column('int')
  quantity: number;

  @Column('float')
  distanceKm: number;

  @Column('float')
  radius: number;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACTIVE', 'FULFILLED', 'CANCELLED'],
    default: 'PENDING'
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  notificationSent: boolean;

  @Column({ nullable: true })
  notificationSentAt: Date;

  @Column({ default: 0 })
  donorsNotified: number;
}