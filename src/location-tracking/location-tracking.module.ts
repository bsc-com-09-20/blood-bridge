import { Module } from '@nestjs/common';
import { LocationTrackingController } from './location-tracking.controller';
import { LocationTrackingService } from './location-tracking.service';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  controllers: [LocationTrackingController],
  providers: [LocationTrackingService, FirebaseService],
})
export class LocationTrackingModule {}