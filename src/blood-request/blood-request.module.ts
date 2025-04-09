import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloodRequest } from './entities/blood-request.entity';
import { BloodRequestService } from './blood-request.service';
import { BloodRequestController } from './blood-request.controller';
import { HospitalModule } from '../hospital/hospital.module';
import { DonorModule } from '../donor/donor.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([BloodRequest]),
    HospitalModule,
    DonorModule,
    AuthModule, 
    NotificationModule,// Add this to import JwtModule/JwtService
  ],
  providers: [BloodRequestService],
  controllers: [BloodRequestController],
  exports: [BloodRequestService],
})
export class BloodRequestModule {}