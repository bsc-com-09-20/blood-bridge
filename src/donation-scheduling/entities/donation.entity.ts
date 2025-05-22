import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('donation_schedules')
export class DonationSchedule {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the donation schedule' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Blood type required for this donation' })
  bloodType: string;

  @Column()
  @ApiProperty({ description: 'Number of units required' })
  unitsRequired: number;

  @Column({ type: 'date' })
  scheduledDate: Date;

  // Replace timeSlot with separate startTime and endTime columns
  @Column()
  @ApiProperty({ description: 'Start time for the donation' })
  startTime: string;

  @Column()
  @ApiProperty({ description: 'End time for the donation' })
  endTime: string;

  @Column({ default: 0 })
  @ApiProperty({ description: 'Number of donors currently assigned to this schedule' })
  donorsAssigned: number;

  @Column()
  @ApiProperty({ description: 'Number of donors needed for this schedule' })
  donorsNeeded: number;

  @Column({ default: false })
  @ApiProperty({ description: 'Whether this donation is critical' })
  critical: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Additional notes for the donation schedule' })
  notes: string;

  @Column()
  @ApiProperty({ description: 'Location for the donation session' })
  location: string;

  @Column()
  @ApiProperty({ description: 'Hospital ID associated with this donation schedule' })
  hospitalId: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Timestamp when the record was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Timestamp when the record was last updated' })
  updatedAt: Date;
}