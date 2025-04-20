import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import * as twilio from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private twilioClient: twilio.Twilio;
  private logger = new Logger('NotificationService');

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private configService: ConfigService
  ) {
    // Initialize Twilio client with credentials from environment variables
    this.twilioClient = twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN')
    );
  }

  async sendSms(phoneNumber: string, message: string) {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phoneNumber
      });
      
      this.logger.log(`SMS sent to ${phoneNumber}, SID: ${result.sid}`);
      
      // Create a record of this notification
      await this.create({
        recipient: phoneNumber,
        message: message,
        type: 'SMS',
        status: 'SENT'
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
      
      // Create a record of the failed notification
      await this.create({
        recipient: phoneNumber,
        message: message,
        type: 'SMS',
        status: 'FAILED'
      });
      
      throw error;
    }
  }

  async sendBloodRequestSms(donorPhone: string, hospitalName: string, bloodType: string) {
    const message = `URGENT: ${hospitalName} needs blood type ${bloodType}. Please respond if you can donate. Thank you for saving lives!`;
    return this.sendSms(donorPhone, message);
  }

  // CRUD operations with database repository
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(createNotificationDto);
    await this.notificationsRepository.save(notification);
    this.logger.log(`Created notification with ID: ${notification.id}`);
    return notification;
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationsRepository.find();
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({ where: { id } });
    if (!notification) {
      this.logger.warn(`Notification with ID ${id} not found`);
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    
    // Update the entity with the new values
    Object.assign(notification, updateNotificationDto);
    
    await this.notificationsRepository.save(notification);
    this.logger.log(`Updated notification with ID: ${id}`);
    return notification;
  }

  async remove(id: number): Promise<void> {
    const result = await this.notificationsRepository.delete(id);
    
    if (result.affected === 0) {
      this.logger.warn(`Cannot remove: Notification with ID ${id} not found`);
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    this.logger.log(`Removed notification with ID: ${id}`);
  }
}