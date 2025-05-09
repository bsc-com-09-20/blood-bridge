import { IsNotEmpty, IsString, IsInt, IsBoolean, IsOptional, IsDateString, Min, IsUUID, Matches, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDonationScheduleDto {
  @ApiProperty({ description: 'Blood type required', example: 'A+' })
  @IsNotEmpty()
  @IsString()
  bloodType: string;

  @ApiProperty({ description: 'Number of units required', example: 3 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  unitsRequired: number;

  @IsDate()
  @Type(() => Date)
  scheduleDate: Date;

  // Replace timeSlot with separate startTime and endTime
  @ApiProperty({ description: 'Start time for the donation', example: '10:00 AM' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, {
    message: 'Start time format must be HH:MM AM/PM',
  })
  startTime: string;

  @ApiProperty({ description: 'End time for the donation', example: '12:00 PM' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, {
    message: 'End time format must be HH:MM AM/PM',
  })
  endTime: string;

  @ApiProperty({ description: 'Number of donors assigned to this schedule', example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  donorsAssigned: number = 0;

  @ApiProperty({ description: 'Number of donors needed for this schedule', example: 3 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  donorsNeeded: number;

  @ApiProperty({ description: 'Whether this donation is critical', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  critical: boolean = false;

  @ApiPropertyOptional({ description: 'Additional notes for the donation schedule' })
  @IsOptional()
  @IsString()
  notes?: string;

  // Add a typed location field
  @ApiProperty({ description: 'Location for the donation session', example: 'Main Building' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ description: 'Hospital ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  hospitalId: string;
}