import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';
import { HospitalService } from './hospital.service';
import { HospitalController } from './hospital.controller';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Hospital]),
    AuthModule, // This provides JwtService
  ],
  providers: [HospitalService],
  controllers: [HospitalController],
  exports: [HospitalService, TypeOrmModule],
})
export class HospitalModule {}