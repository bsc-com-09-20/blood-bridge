/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventController } from './events.controller';
import { FirebaseModule } from '../firebase/firebase.module';


@Module({
  imports: [forwardRef(() => FirebaseModule)],
  providers: [EventsService],
  controllers: [EventController],
})
export class EventsModule {}
