import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class UpdateBloodInventoryDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  availableUnits?: number;
}