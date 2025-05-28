import { IsString, IsEmail, IsOptional, IsEnum, MinLength, IsISO8601, IsNumber } from 'class-validator';
import { DonorStatus } from 'src/common/enums/donor-status.enum';

export class UpdateDonorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsISO8601()
  lastDonation?: string;

  @IsOptional()
  @IsNumber()
  donations?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsEnum(DonorStatus)
  status?: DonorStatus;
}

// Updated UpdatePasswordDto
export class UpdatePasswordDto {
  // Remove currentPassword requirement
  newPassword: string;
}