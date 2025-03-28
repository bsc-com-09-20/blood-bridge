import { Module } from '@nestjs/common';
import { BloodInventoryService } from './blood-inventory.service';
import { BloodInventoryController } from './blood-inventory.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  controllers: [BloodInventoryController],
  providers: [BloodInventoryService, FirebaseService],
  exports: [BloodInventoryService],
})
export class BloodInventoryModule {}
