// donation-scheduling.dto.ts
import { IsNotEmpty, IsString, IsInt, IsBoolean, IsOptional, IsDateString, Min, IsUUID, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class AssignDonorDto {
    @ApiProperty({ description: 'Donor ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty()
    @IsUUID()
    donorId: string;
  
    @ApiProperty({ description: 'Donation Schedule ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty()
    @IsUUID()
    scheduleId: string;
  }