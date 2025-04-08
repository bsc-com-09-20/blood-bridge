import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, IsIn } from 'class-validator';
import { bloodTypes } from './constants';

export class CreateHospitalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  contactPhone: string;

  @IsNotEmpty()
  location: {
    latitude: number;
    longitude: number;
  };

  @IsString()
  @IsIn(bloodTypes)
  bloodTypeNeeded: string;
}