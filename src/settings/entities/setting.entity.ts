import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  donorId: number;

  @Column({ default: true })
  notificationEnabled: boolean;

  @Column({ default: 'weekly' })
  emailFrequency: string;

  @Column({ default: 'private' })
  privacyLevel: string;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: 'en' })
  language: string;
  
  // Keep these if you still need them for authentication
  // Otherwise they can be removed
  @Column({ nullable: true })
  email: string;
  
  @Column({ nullable: true })
  password: string;
}