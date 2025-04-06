// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import {  CreateDonorDto } from '../donor/dto/create-donor.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  
  @Post('login')
  @ApiBody({ type: LoginDto })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiBody({ type: CreateDonorDto })
  register(@Body() createDonorDto: CreateDonorDto) {
    return this.authService.registerDonor(createDonorDto);
  }
}
