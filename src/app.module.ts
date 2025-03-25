import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HospitalModule } from './hospital/hospital.module';
import { DonorModule } from './donor/donor.module';
import { BloodRequestModule } from './blood-request/blood-request.module';
import { SettingsModule } from './settings/settings.module';
import { LocationTrackingModule } from './location-tracking/location-tracking.module';
import { NotificationModule } from './notification/notification.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase/firebase.service';

@Module({
  imports: [   ConfigModule.forRoot({
    isGlobal: true,
   envFilePath: '.env',
  }),HospitalModule, DonorModule, BloodRequestModule, SettingsModule, LocationTrackingModule, NotificationModule, FirebaseModule, AuthModule],
  controllers: [AppController],
  providers: [AppService,FirebaseService],
})
export class AppModule {}
