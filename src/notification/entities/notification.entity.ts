import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipient: string;

  @Column()
  message: string;

  @Column()
  type: string; // e.g., 'SMS', 'EMAIL', 'PUSH'

  @Column()
  status: string; // e.g., 'SENT', 'DELIVERED', 'FAILED'

  @Column({ nullable: true })
  serviceResponse: string; // Response from notification service (e.g., Twilio SID)

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;
}