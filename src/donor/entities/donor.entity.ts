import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Point } from 'geojson';
import { DonorStatus } from 'src/common/enums/donor-status.enum';

@Entity()
export class Donor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10 }) // e.g., O+, A-, B+, etc.
  bloodGroup: string;

  @Column({ type: 'date', nullable: true })
  lastDonation?: Date;

  @Column({ type: 'int', nullable: true, default: 0 })
  donations?: number;

  @Column({ unique: true })
  email: string;

  @Column({ length: 15 })
  phone: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column('float', { nullable: true })
  latitude: number;

  @Column('float', { nullable: true })
  longitude: number;

  @Column({ type: 'timestamp', nullable: true })
  lastActive: Date;

  // Add status column with default value
  @Column({
    type: 'enum',
    enum: DonorStatus,
    default: DonorStatus.ACTIVE
  })
  status: DonorStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
@Column({ type: 'varchar', length: 255, nullable: true })
resetToken: string | null;

@Column({ type: 'timestamp', nullable: true })
resetTokenExpires: Date | null;
}