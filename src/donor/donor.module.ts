import { Module, forwardRef } from '@nestjs/common';
import { DonorService } from './donor.service';
import { DonorController } from './donor.controller';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [forwardRef(() => FirebaseModule)], // ✅ Fix circular dependency
  controllers: [DonorController],
  providers: [DonorService],
})
export class DonorModule {}
