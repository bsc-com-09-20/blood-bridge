import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  Matches, 
  MinLength, 
  IsOptional, 
  IsNumber,
  IsDate,
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

// ✅ Location DTO for nested validation
export class LocationDto {
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  geohash?: string;
}

// ✅ Donor DTO with proper validation
export class CreateDonorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  bloodGroup: string;

  @IsOptional()
  @IsDate() // ✅ Ensures it's a valid date
  @Type(() => Date) // ✅ Converts input into a Date object
  lastDonation?: Date;

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
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
