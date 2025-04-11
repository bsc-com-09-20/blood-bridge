import { IsEnum, IsInt, IsPositive } from 'class-validator';
import { BloodGroup } from '../entities/blood-inventory.entity';

export class CreateBloodInventoryDto {
  @IsEnum(BloodGroup)
  bloodGroup: BloodGroup;

  @IsInt()
  @IsPositive()
  availableUnits: number;
}