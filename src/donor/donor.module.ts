import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonorService } from './donor.service';
import { DonorController } from './donor.controller';
import { Donor } from './entities/donor.entity';
import { JwtModule } from '@nestjs/jwt';  // Import JwtModule
import { Reflector } from '@nestjs/core';  // Import Reflector
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donor]),  // Import TypeORM for Donor entity
    JwtModule.register({
      secret: 'secretKey',  // Set your JWT secret key here
      signOptions: { expiresIn: '1d' },  // Set expiration options
    }),
  ],
  controllers: [DonorController],
  providers: [DonorService, AuthGuard, Reflector],  // Register AuthGuard and Reflector
})
export class DonorModule {}
