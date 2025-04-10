/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HospitalModule } from './hospital/hospital.module';
import { BloodRequestModule } from './blood-request/blood-request.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationModule } from './notification/notification.module';
import { DonorModule } from './donor/donor.module';
import { Donor } from './donor/entities/donor.entity';
import { BloodInventory } from './blood-inventory/entities/blood-inventory.entity';
import { BloodRequest } from './blood-request/entities/blood-request.entity';
import { Hospital } from './hospital/entities/hospital.entity';
import { AuthModule } from './auth/auth.module';
import { BloodTypeModule } from './blood-type/blood-type/blood-type.module';
import { BloodInventoryModule } from './blood-inventory/blood-inventory.module';
import { EventsModule } from './events/events.module';
import { Event } from './events/entities/event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../.env'),
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT!, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Donor, BloodInventory, BloodRequest, Hospital, Event],
      synchronize: true, 
      autoLoadEntities: true,
      
    }),
    
    // Feature Modules
    BloodInventoryModule,
    AuthModule,
    HospitalModule,
    BloodRequestModule,
    SettingsModule,
    NotificationModule,
    DonorModule,
    BloodTypeModule,
    EventsModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
