import { Module } from '@nestjs/common';
import { LocationTrackingService } from './location-tracking.service';
import { LocationTrackingController } from './location-tracking.controller';

@Module({
  controllers: [LocationTrackingController],
  providers: [LocationTrackingService],
})
export class LocationTrackingModule {}
