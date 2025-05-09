import { PartialType } from '@nestjs/mapped-types';
import { CreateDonorDto } from './create-donor.dto';
import { IsEnum, IsOptional, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { DonorStatus } from 'src/common/enums/donor-status.enum';

export class UpdateDonorDto extends PartialType(CreateDonorDto) {
  @IsOptional()
  @IsEnum(DonorStatus)
  status?: DonorStatus;

  // Remove password from here - password updates should only go through UpdatePasswordDto
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8) // Increased from 6 to 8 for better security
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/, {
    message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;
}