import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, IsOptional, IsEnum } from 'class-validator';
import { DonorStatus } from 'src/common/enums/donor-status.enum';

// DTO for filtering donors
export class FilterDonorDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    bloodGroup?: string;

    @IsOptional()
    @IsEnum(DonorStatus)
    status?: DonorStatus;
  
    @IsOptional()
    @IsString()
    search?: string;
  }