import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateBloodInventoryDto {
  @ApiProperty({ example: 'A+' })
  @IsString()
  @IsNotEmpty()
  bloodGroup: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  availableUnits: number;

  @ApiProperty({ example: 'Sufficient' })
  @IsString()
  @IsNotEmpty()
  status: string;
}