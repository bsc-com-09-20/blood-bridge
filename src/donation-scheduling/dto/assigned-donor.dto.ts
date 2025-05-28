// assigned-donor.dto.ts
import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignDonorDto {
  @ApiProperty({ description: 'Schedule ID to assign donor to', type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  scheduleId: number; // Ensure this is number

  @ApiProperty({ description: 'Donor ID to assign', type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  donorId: number; // Ensure this is number
}