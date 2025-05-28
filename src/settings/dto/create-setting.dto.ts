import { IsEmail, IsNotEmpty, MinLength, IsNumber, IsBoolean, IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty({ example: 1, description: 'The ID of the donor this setting belongs to' })
  @IsNumber()
  @IsNotEmpty()
  donorId: number;
  
  @ApiPropertyOptional({ example: true, description: 'Whether notifications are enabled' })
  @IsBoolean()
  @IsOptional()
  notificationEnabled?: boolean;
  
  @ApiPropertyOptional({ example: 'weekly', enum: ['daily', 'weekly', 'monthly', 'never'], description: 'How often emails should be sent' })
  @IsString()
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'never'])
  emailFrequency?: string;
  
  @ApiPropertyOptional({ example: 'private', enum: ['public', 'private', 'anonymous'], description: 'Privacy level of the donor settings' })
  @IsString()
  @IsOptional()
  @IsIn(['public', 'private', 'anonymous'])
  privacyLevel?: string;
  
  @ApiPropertyOptional({ example: 'light', description: 'Preferred theme: light or dark' })
  @IsString()
  @IsOptional()
  theme?: string;
  
  @ApiPropertyOptional({ example: 'en', description: 'Preferred language code (e.g. en, fr)' })
  @IsString()
  @IsOptional()
  language?: string;
  
  @ApiPropertyOptional({ example: 'user@example.com', description: 'Email address (optional)' })
  @IsEmail()
  @IsOptional()
  email?: string;
  
  @ApiPropertyOptional({ example: 'secret123', description: 'Password with minimum length of 6 characters' })
  @IsOptional()
  @MinLength(6)
  password?: string;
}
