import { Module, forwardRef } from '@nestjs/common';
import { DonorController } from './donor.controller';
import { DonorService } from './donor.service';
import { FirebaseService } from '../services/firebase.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [forwardRef(() => FirebaseModule)], 
  controllers: [DonorController],
  providers: [DonorService, FirebaseService],
  exports: [DonorService],
})
export class DonorModule {}
