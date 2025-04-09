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
    enum: BloodType
  })
  bloodType: BloodType;

  @Column('int')
  quantity: number;

  @Column('float')
  distanceKm: number;

  @Column({
    default: 'pending',
    enum: ['pending', 'accepted', 'rejected', 'fulfilled']
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  notificationSent: boolean;

  @Column({ nullable: true })
  notificationSentAt: Date;

}