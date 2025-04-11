/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  // Date and time fields
  @Column({ type: 'date' })
  eventDate: Date;

  @Column({ type: 'time' })
  startTime: string;
  
  @Column({ type: 'time' })
  endTime: string;

  // Location fields
  @Column({ length: 255 })
  location: string;
  
  @Column({ length: 255, nullable: true })
  locationAddress: string;
  
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  // Event capacity and spots
  @Column({ type: 'integer', default: 0 })
  totalSpots: number;
  
  @Column({ type: 'integer', default: 0 })
  registeredCount: number;
  
  @Column({ type: 'integer', default: 0 })
  availableSpots: number;

  // For filtering and searching
  @Column({ default: false })
  isPublished: boolean;
  
  @Column({ default: false })
  isWeekend: boolean;
  
  @Column({ default: false })
  isThisWeek: boolean;
  
  @Column({ length: 50, nullable: true })
  @Index()
  eventType: string;
  
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // For displaying distance
  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  distance: number;
  
  @Column({ length: 50, nullable: true })
  distanceUnit: string;

  // Organizer information
  @Column({ length: 100, nullable: true })
  organizer: string;
  
  @Column({ length: 100, nullable: true })
  organizerContact: string;

  // Event image
  @Column({ length: 255, nullable: true })
  imageUrl: string;

  // Status field
  @Column({ 
    type: 'enum', 
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], 
    default: 'scheduled' 
  })
  status: string;

  // Registration deadline
  @Column({ type: 'timestamp', nullable: true })
  registrationDeadline: Date;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}