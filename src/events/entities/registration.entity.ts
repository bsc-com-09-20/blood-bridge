// registration.entity.ts
/* eslint-disable prettier/prettier */
import { Donor } from 'src/donor/entities/donor.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, event => event.id)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => Donor, donor => donor.id)  // Establish relation with Donor
  @JoinColumn({ name: 'donorId' })
  donor: Donor;  // Relating the donor to the registration

  @Column({ type: 'timestamp' })
  registrationDate: Date;

  // Additional fields can be added if necessary (e.g., status, notes)
}
