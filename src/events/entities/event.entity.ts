// event.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  eventDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  locationAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'int', default: 0 })
  totalSpots: number;

  @Column({ type: 'int', default: 0 })
  registeredCount: number;

  @Column({ type: 'int', default: 0 })
  availableSpots: number;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'boolean', default: false })
  isWeekend: boolean;

  @Column({ type: 'boolean', default: false })
  isThisWeek: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  eventType: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  distance: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  distanceUnit: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  organizer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  organizerContact: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  registrationDeadline: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}