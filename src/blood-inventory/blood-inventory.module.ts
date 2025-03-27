import { Module } from '@nestjs/common';
import { BloodInventoryService } from './blood-inventory.service';
import { BloodInventoryController } from './blood-inventory.controller';
import { FirebaseModule } from '../firebase/firebase.module'; // Import the FirebaseModule

@Module({
  imports: [FirebaseModule], // Include FirebaseModule in the imports array
  controllers: [BloodInventoryController],
  providers: [BloodInventoryService],
})
export class BloodInventoryModule {}
