import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  IsNumber,
  IsDate,
  MinLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BloodType } from '../../common/enums/blood-type.enum';
import { DonorStatus } from 'src/common/enums/donor-status.enum';

export class UpdateDonorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(BloodType)
  bloodGroup?: BloodType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastDonation?: Date;
  
  @IsOptional()
  @IsNumber()
  donations?: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsDate()
  lastActive?: Date;

  @IsOptional()
  @IsEnum(DonorStatus)
  status?: DonorStatus;
}
