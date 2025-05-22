import { IsString, IsInt, IsBoolean, IsOptional, IsDateString, Min, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDonationScheduleDto {
  @ApiPropertyOptional({ description: 'Blood type required', example: 'A+' })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional({ description: 'Number of units required', example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  unitsRequired?: number;

  @ApiPropertyOptional({ description: 'Date of the donation schedule', example: '2025-04-26T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: Date;

  // Replace timeSlot with separate startTime and endTime
  @ApiPropertyOptional({ description: 'Start time for the donation', example: '10:00 AM' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, {
    message: 'Start time format must be HH:MM AM/PM',
  })
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time for the donation', example: '12:00 PM' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, {
    message: 'End time format must be HH:MM AM/PM',
  })
  endTime?: string;

  @ApiPropertyOptional({ description: 'Number of donors assigned to this schedule', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  donorsAssigned?: number;

  @ApiPropertyOptional({ description: 'Number of donors needed for this schedule', example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  donorsNeeded?: number;

  @ApiPropertyOptional({ description: 'Whether this donation is critical', example: true })
  @IsOptional()
  @IsBoolean()
  critical?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes for the donation schedule' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Location for the donation session', example: 'Main Building' })
  @IsOptional()
  @IsString()
  location?: string;
}