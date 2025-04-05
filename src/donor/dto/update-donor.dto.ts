import { IsEmail, IsOptional, IsString, Matches, IsNumber, IsDate, ValidateNested } from 'class-validator';
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

// ✅ UpdateDonorDto with proper validation
export class UpdateDonorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsDate() // ✅ Ensures it's a valid date
  @Type(() => Date) // ✅ Converts input into a Date object
  lastDonation?: Date;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;  

  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto) // ✅ Ensures proper type conversion
  location?: LocationDto;
}
