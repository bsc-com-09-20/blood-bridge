import { IsString, IsOptional, IsEnum } from 'class-validator';
import { NotificationType, NotificationStatus } from './create-notification.dto';

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  recipient?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: string;

  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  externalId?: string;
}