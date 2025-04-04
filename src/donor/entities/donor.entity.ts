import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Donor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10 }) // e.g., O+, A-, B+, etc.
  bloodGroup: string;

  @Column({ type: 'date', nullable: true })
  lastDonation?: Date; // Now optional

  @Column({ unique: true })
  email: string;

  @Column({ length: 15 })
  phone: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ type: 'jsonb', nullable: true })
  location?: {
    latitude: number;
    longitude: number;
    geohash: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
