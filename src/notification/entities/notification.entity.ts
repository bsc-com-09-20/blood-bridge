import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NotificationType, NotificationStatus } from '../dto/create-notification.dto';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipient: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SMS
  })
  type: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING
  })
  status: string;

  @Column({ nullable: true })
  externalId?: string; // For IDs returned by external services like Twilio's SID

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
