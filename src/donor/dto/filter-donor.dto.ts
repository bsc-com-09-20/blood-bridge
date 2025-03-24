import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, IsOptional } from 'class-validator';

// DTO for filtering donors
export class FilterDonorDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    bloodGroup?: string;
  }