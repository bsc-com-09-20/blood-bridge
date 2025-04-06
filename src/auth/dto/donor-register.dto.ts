import { 
    IsEmail, 
    IsNotEmpty, 
    IsString, 
    IsNumber,
    IsEnum 
  } from 'class-validator';
  import { BloodType } from '../../common/enums/blood-type.enum';
  
  export class DonorRegisterDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    @IsString()
    @IsNotEmpty()
    password: string;
  
    @IsString()
    @IsNotEmpty()
    phone: string;
  
    @IsEnum(BloodType)
    bloodGroup: BloodType;
  
    @IsNumber()
    latitude: number;  // Required for donor location
  
    @IsNumber()
    longitude: number; // Required for donor location
  }