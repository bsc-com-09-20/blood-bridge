import { Module, forwardRef } from '@nestjs/common';
import { DonorsController } from './donor.controller';
import { DonorService } from './donor.service';
import { FirebaseService } from '../services/firebase.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [forwardRef(() => FirebaseModule)], // ✅ Fix circular dependency
  controllers: [DonorsController],
  providers: [DonorService, FirebaseService],
  exports: [DonorService], // Ensuring other modules can use DonorsService
})
export class DonorsModule {}
