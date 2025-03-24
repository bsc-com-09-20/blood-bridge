import { PartialType } from '@nestjs/swagger';
import { CreateDonorDto } from './create-donor.dto';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, IsOptional } from 'class-validator';

export class UpdateDonorDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    bloodGroup?: string;
  
    @IsOptional()
    @IsString()
    lastDonation?: string;
  
    @IsOptional()
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @Matches(/^\d{10}$/, { message: 'Phone number must be 10 digits' })
    phone?: string;
  }
  

