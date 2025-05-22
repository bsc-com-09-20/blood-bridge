import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationSchedulingService } from './donation-scheduling.service';
import { DonationSchedulingController } from './donation-scheduling.controller';
import { DonationSchedule } from '../entities/donation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DonationSchedule])],
  providers: [DonationSchedulingService],
  controllers: [DonationSchedulingController],
})
export class DonationSchedulingModule {}
