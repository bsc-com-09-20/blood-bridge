import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/auth/auth.guard';

@ApiTags('notifications')
@Public()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification record' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific notification' })
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Get('recipient/:phoneNumber')
  @ApiOperation({ summary: 'Get notifications by recipient phone number' })
  findByRecipient(@Param('phoneNumber') phoneNumber: string) {
    return this.notificationService.getNotificationsByRecipient(phoneNumber);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}