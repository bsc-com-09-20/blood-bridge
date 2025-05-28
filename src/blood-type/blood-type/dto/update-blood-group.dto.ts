import { IsOptional, IsString } from 'class-validator';

export class UpdateBloodGroupDto {
  @IsOptional()
  @IsString()
  bloodGroup?: string; // Changed from 'type' to 'bloodGroup'

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  canDonateTo?: string; // Added missing field

  @IsOptional()
  @IsString()
  canReceiveFrom?: string; // Added missing field
}