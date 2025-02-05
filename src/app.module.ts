import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HospitalModule } from './hospital/hospital.module';
import { DonorModule } from './donor/donor.module';
import { BloodRequestModule } from './blood-request/blood-request.module';
import { SettingsModule } from './settings/settings.module';
import { LocationTrackingModule } from './location-tracking/location-tracking.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [HospitalModule, DonorModule, BloodRequestModule, SettingsModule, LocationTrackingModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
