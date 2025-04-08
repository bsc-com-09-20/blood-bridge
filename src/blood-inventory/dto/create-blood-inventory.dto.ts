// src/blood-inventory/dto/create-blood-inventory.dto.ts
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateBloodInventoryDto {
  @IsString()
  @IsNotEmpty()
  bloodGroup: string;

  @IsInt()
  @Min(0)
  availableUnits: number;
}
