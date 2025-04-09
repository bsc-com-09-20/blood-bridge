import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    ConfigModule, // Make sure ConfigModule is available for the service
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService], // Export the service so other modules can use it
})
export class NotificationModule {}