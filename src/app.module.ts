import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HospitalModule } from './hospital/hospital.module';
import { BloodRequestModule } from './blood-request/blood-request.module';
import { SettingsModule } from './settings/settings.module';
import { LocationTrackingModule } from './location-tracking/location-tracking.module';
import { NotificationModule } from './notification/notification.module';
import { DonorModule } from './donor/donor.module';
import { Donor } from './donor/entities/donor.entity';
import { BloodInventory } from './blood-inventory/entities/blood-inventory.entity';
import { BloodRequest } from './blood-request/entities/blood-request.entity';
import { Hospital } from './hospital/entities/hospital.entity';
import { AuthModule } from './auth/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../.env'),
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'blood_bridge_db',
      entities: [Donor, BloodInventory, BloodRequest, Hospital],
      synchronize: true, // Set to false in production
      autoLoadEntities: true,
    }),

    HospitalModule,
    BloodRequestModule,
    SettingsModule,
    LocationTrackingModule,
    NotificationModule,
    DonorModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
