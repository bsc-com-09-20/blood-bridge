// blood-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloodGroup } from './entities/blood-group.entity';
import { BloodGroupService } from './blood-type.service';
import { BloodGroupController } from './blood-type.controller';
import { BloodGroupSeederService } from '../seeders/blood-type-seeders';

@Module({
  imports: [TypeOrmModule.forFeature([BloodGroup])],
  providers: [BloodGroupService, BloodGroupSeederService],
  controllers: [BloodGroupController],
  exports: [BloodGroupService],
})
export class BloodTypeModule {}
