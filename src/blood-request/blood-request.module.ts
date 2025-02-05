import { Module } from '@nestjs/common';
import { BloodRequestService } from './blood-request.service';
import { BloodRequestController } from './blood-request.controller';

@Module({
  controllers: [BloodRequestController],
  providers: [BloodRequestService],
})
export class BloodRequestModule {}
