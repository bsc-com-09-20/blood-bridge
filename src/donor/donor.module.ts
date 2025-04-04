import { Module, forwardRef } from '@nestjs/common';
import { DonorService } from './donor.service';
import { DonorController } from './donor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donor } from './entities/donor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donor]) // Register the Donor entity here to make DonorRepository available
  ],
  controllers: [DonorController],
  providers: [DonorService],
})
export class DonorModule {}
