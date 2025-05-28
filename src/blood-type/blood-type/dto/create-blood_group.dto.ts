import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBloodGroupDto {
  @IsNotEmpty()
  @IsString()
  bloodGroup: string; // Changed from 'type' to 'bloodGroup'

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  canDonateTo: string; // Added missing field

  @IsNotEmpty()
  @IsString()
  canReceiveFrom: string; // Added missing field
}