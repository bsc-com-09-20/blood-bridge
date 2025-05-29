// donor.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DonorStatus } from 'src/common/enums/donor-status.enum';

@Entity('donors')
export class Donor {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  bloodGroup: string;

  @Column({ type: 'date', nullable: true })
  lastDonation?: Date;

  @Column({ type: 'int', nullable: true, default: 0 })
  donations?: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 15 })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'timestamp', nullable: true })
  lastActive: Date;

  @Column({
    type: 'enum',
    enum: DonorStatus,
    default: DonorStatus.ACTIVE
  })
  status: DonorStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  
@Column({ type: 'varchar', length: 255, nullable: true })
resetToken: string | null;

@Column({ type: 'timestamp', nullable: true })
resetTokenExpires: Date | null;
}