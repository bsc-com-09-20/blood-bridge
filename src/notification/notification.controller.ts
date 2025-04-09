import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpStatus, 
  HttpCode,
  Query,
  ValidationPipe
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'The notification has been successfully created.' })
  @ApiBody({ type: CreateNotificationDto })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'Return all notifications.' })
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by id' })
  @ApiResponse({ status: 200, description: 'Return the notification.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiResponse({ status: 200, description: 'The notification has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiBody({ type: UpdateNotificationDto })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 204, description: 'The notification has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }

  @Post('send-sms')
  @ApiOperation({ summary: 'Send an SMS notification' })
  @ApiResponse({ status: 200, description: 'The SMS has been successfully sent.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string', example: '+15551234567' },
        message: { type: 'string', example: 'Your notification message' }
      },
      required: ['phoneNumber', 'message']
    }
  })
  async sendSms(
    @Body('phoneNumber') phoneNumber: string,
    @Body('message') message: string
  ) {
    return this.notificationService.sendSms(phoneNumber, message);
  }

  @Post('blood-request')
  @ApiOperation({ summary: 'Send a blood request SMS notification' })
  @ApiResponse({ status: 200, description: 'The blood request SMS has been successfully sent.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        donorPhone: { type: 'string', example: '+15551234567' },
        hospitalName: { type: 'string', example: 'City General Hospital' },
        bloodType: { type: 'string', example: 'O-' }
      },
      required: ['donorPhone', 'hospitalName', 'bloodType']
    }
  })
  async sendBloodRequestSms(
    @Body('donorPhone') donorPhone: string,
    @Body('hospitalName') hospitalName: string,
    @Body('bloodType') bloodType: string
  ) {
    return this.notificationService.sendBloodRequestSms(donorPhone, hospitalName, bloodType);
  }
}