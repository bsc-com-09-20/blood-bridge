import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BloodType } from '../../common/enums/blood-type.enum';
import { DonorStatus } from 'src/common/enums/donor-status.enum';

export class CreateDonorDto {
  @ApiProperty({
    description: 'Full name of the donor',
    example: 'John Doe'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Blood group of the donor',
    enum: BloodType,
    example: BloodType.A_POSITIVE
  })
  @IsNotEmpty()
  @IsEnum(BloodType)
  bloodGroup: BloodType;

  @ApiPropertyOptional({
    description: 'Date of last blood donation',
    type: Date,
    example: '2024-01-15T10:30:00Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastDonation?: Date;
  
  @ApiPropertyOptional({
    description: 'Total number of previous donations',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  donations?: number;

  @ApiProperty({
    description: 'Email address of the donor',
    example: 'john.doe@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number in E.164 international format',
    example: '+1234567890'
  })
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone: string;

  @ApiProperty({
    description: 'Password for donor account (minimum 6 characters)',
    minLength: 6,
    example: 'SecurePass123'
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Geographic latitude coordinate',
    example: 40.7128
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Latitude is required for login' })
  @Type(() => Number)
  latitude?: number;

  @ApiProperty({
    description: 'Geographic longitude coordinate',
    example: -74.0060
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Longitude is required for login' })
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Current status of the donor',
    enum: DonorStatus,
    default: DonorStatus.ACTIVE,
    example: DonorStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(DonorStatus)
  status?: DonorStatus = DonorStatus.ACTIVE;
}