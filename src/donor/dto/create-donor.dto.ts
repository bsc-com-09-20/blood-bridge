import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, IsOptional,IsBoolean } from 'class-validator';

// DTO for creating a new donor
export class CreateDonorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  bloodGroup: string;

  @IsOptional()
  @IsString()
  lastDonation?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Phone number must be 10 digits' })
  phone: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  
}
