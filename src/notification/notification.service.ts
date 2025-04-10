import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import * as twilio from 'twilio';
import { ConfigService } from '@nestjs/config';
import { BloodType } from '../common/enums/blood-type.enum';

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
        status: 'SENT',
        serviceResponse: result.sid
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
      
      // Create a record of the failed notification
      await this.create({
        recipient: phoneNumber,
        message: message,
        type: 'SMS',
        status: 'FAILED',
        serviceResponse: error.message
      });
      
      throw error;
    }
  }

  async sendBloodRequestSms(
    donorPhone: string, 
    hospitalName: string, 
    bloodType: BloodType, 
    radius: number,
    distance: number
  ) {
    const message = this.createBloodRequestMessage(
      hospitalName,
      bloodType,
      radius,
      distance
    );
    
    return this.sendSms(donorPhone, message);
  }

  private createBloodRequestMessage(
    hospitalName: string,
    bloodType: BloodType | 'ALL',
    radius: number,
    distance: number
  ): string {
    const distanceText = distance ? `(you're ${distance.toFixed(1)}km away)` : '';
    
    if (bloodType === 'ALL') {
      return `URGENT: ${hospitalName} needs blood donors within ${radius}km ${distanceText}. ` +
             `Please respond if available. Thank you for saving lives!`;
    }
    
    return `URGENT: ${hospitalName} needs ${this.formatBloodType(bloodType)} blood donors ` +
           `within ${radius}km ${distanceText}. Please respond if available. Thank you!`;
  }

  private formatBloodType(bloodType: BloodType): string {
    const typeMap = {
      'A_POSITIVE': 'A+',
      'A_NEGATIVE': 'A-',
      'B_POSITIVE': 'B+',
      'B_NEGATIVE': 'B-',
      'AB_POSITIVE': 'AB+',
      'AB_NEGATIVE': 'AB-',
      'O_POSITIVE': 'O+',
      'O_NEGATIVE': 'O-',
    };
    return typeMap[bloodType] || bloodType;
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

  async getNotificationsByRecipient(phoneNumber: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { recipient: phoneNumber },
      order: { createdAt: 'DESC' }
    });
  }
}