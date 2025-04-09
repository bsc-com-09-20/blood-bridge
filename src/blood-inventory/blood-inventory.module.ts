import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloodInventoryService } from './blood-inventory.service';
import { BloodInventoryController } from './blood-inventory.controller';
import { BloodInventory } from './entities/blood-inventory.entity'

@Module({
  imports: [TypeOrmModule.forFeature([BloodInventory])],
  controllers: [BloodInventoryController],
  providers: [BloodInventoryService],
  exports: [BloodInventoryService],
})
export class BloodInventoryModule {}
