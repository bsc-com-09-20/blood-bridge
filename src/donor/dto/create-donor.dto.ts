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
import { DonorStatus } from 'src/common/enums/donor-status.enum';

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

  @IsNumber()
  @IsNotEmpty({ message: 'Latitude is required for login' })
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Latitude is required for login' })
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsEnum(DonorStatus)
  status?: DonorStatus = DonorStatus.ACTIVE;
}
