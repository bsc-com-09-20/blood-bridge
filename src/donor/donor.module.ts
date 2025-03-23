import { Module } from '@nestjs/common';
import { DonorsController } from './donors.controller';
import { DonorsService } from './donors.service';
import { FirebaseService } from '../services/firebase.service';

@Module({
  controllers: [DonorsController],
  providers: [DonorsService, FirebaseService],
})
export class DonorsModule {}