// src/hospital/dto/update-hospital.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsNumber, MinLength } from 'class-validator';

export class UpdateHospitalDto {
  @ApiProperty({ example: 'new-email@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'newpassword123', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'Updated Hospital Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 28.6139, required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 77.2090, required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}