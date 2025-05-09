// donation-scheduling.dto.ts
import { IsNotEmpty, IsString, IsInt, IsBoolean, IsOptional, IsDateString, Min, IsUUID, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class DateRangeDto {
    @ApiProperty({ description: 'Start date', example: '2025-04-01T00:00:00.000Z' })
    @IsNotEmpty()
    @IsDateString()
    startDate: string;
  
    @ApiProperty({ description: 'End date', example: '2025-04-30T23:59:59.999Z' })
    @IsNotEmpty()
    @IsDateString()
    endDate: string;
  
    @ApiPropertyOptional({ description: 'Hospital ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsOptional()
    @IsString()
    hospitalId?: string;
  }