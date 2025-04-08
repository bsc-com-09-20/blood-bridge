// blood-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloodTypeService } from './blood-type.service';
import { BloodTypeController } from './blood-type.controller';
import { BloodType } from './entities/blood-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BloodType])],
  providers: [BloodTypeService],
  controllers: [BloodTypeController],
  exports: [BloodTypeService],
})
export class BloodTypeModule {}
