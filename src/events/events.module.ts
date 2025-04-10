// events.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { Registration } from './entities/registration.entity';
import { Donor } from 'src/donor/entities/donor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Registration, Donor])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
