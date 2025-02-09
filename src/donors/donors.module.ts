import { Module } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { DonorsController } from './donors.controller';

@Module({
  controllers: [DonorsController],
  providers: [DonorsService],
})
export class DonorsModule {}