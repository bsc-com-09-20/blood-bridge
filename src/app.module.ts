import { Module } from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import { DonorsModule } from './donors/donors.module';
import { BloodInventoryModule } from './blood-inventory/blood-inventory.module';
import {HospitalModule} from './hospital/hospital.module';
import {BloodRequestModule} from './blood-request/blood-request.module';
import {SettingsModule} from './settings/settings.module';
import { LocationTrackingModule } from './location-tracking/location-tracking.module';
import { NotificationModule} from './notification/notification.module';

@Module({
  imports: [DonorsModule, BloodInventoryModule, HospitalModule,BloodRequestModule , SettingsModule,
     LocationTrackingModule, NotificationModule ],
     controllers : [AppController ],
     providers : [AppService],
})
export class AppModule {}