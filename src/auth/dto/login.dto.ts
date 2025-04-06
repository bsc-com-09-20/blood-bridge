// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsIn } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

}
