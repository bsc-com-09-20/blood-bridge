// donation-schedule.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('donation_schedules')
export class DonationSchedule {
  @PrimaryGeneratedColumn('increment')
  @ApiProperty({ description: 'Unique identifier for the donation schedule' })
  id: number;

  @Column({ type: 'varchar', length: 10 })
  @ApiProperty({ description: 'Blood type required for this donation' })
  bloodType: string;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Number of units required' })
  unitsRequired: number;

  @Column({ type: 'date' })
  scheduledDate: Date;

  @Column({ type: 'time' })
  @ApiProperty({ description: 'Start time for the donation' })
  startTime: string;

  @Column({ type: 'time' })
  @ApiProperty({ description: 'End time for the donation' })
  endTime: string;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of donors currently assigned to this schedule' })
  donorsAssigned: number;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Number of donors needed for this schedule' })
  donorsNeeded: number;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Whether this donation is critical' })
  critical: boolean;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Additional notes for the donation schedule' })
  notes: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'Location for the donation session' })
  location: string;

  @Column({ type: 'varchar', length: 36 })
  @ApiProperty({ description: 'Hospital ID associated with this donation schedule' })
  hospitalId: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Timestamp when the record was created' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Timestamp when the record was last updated' })
  updatedAt: Date;
}