// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsNumber, Matches  } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty({ message: 'Latitude is required for login' })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @IsNotEmpty({ message: 'Longitude is required for login' })
  @Type(() => Number)
  @IsNumber()
  longitude: number;
}