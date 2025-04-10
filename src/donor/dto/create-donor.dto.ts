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
import { BloodType } from '../../common/enums/blood-type.enum';

export class CreateDonorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(BloodType)
  bloodGroup: BloodType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastDonation?: Date;
  
  @IsOptional()
  @IsNumber()
  donations?: number;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}