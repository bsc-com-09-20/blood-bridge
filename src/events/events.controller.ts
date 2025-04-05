/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, 
  InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Post()
  async create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    this.logger.log(`Attempting to create event: ${JSON.stringify(createEventDto)}`);
    
    // Validate that required fields are present
    if (!createEventDto.title || !createEventDto.description || !createEventDto.eventDate) {
      this.logger.error('Missing required fields in event creation request');
      throw new BadRequestException('Title, description, and eventDate are required fields');
    }

    try {
      // Parse date to ensure it's in the correct format
      if (typeof createEventDto.eventDate === 'string') {
        createEventDto.eventDate = new Date(createEventDto.eventDate);
        
        // Check if date is valid
        if (isNaN(createEventDto.eventDate.getTime())) {
          throw new BadRequestException('Invalid date format for eventDate');
        }
      }
      
      const createdEvent = await this.eventsService.create(createEventDto);
      this.logger.log(`Event created successfully with ID: ${createdEvent.id}`);
      return createdEvent;
    } catch (error) {
      this.logger.error(`Failed to create event: ${error.message}`, error.stack);
      
      // Handle specific errors
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Database or other errors
      throw new InternalServerErrorException(
        `Could not save event to database: ${error.message}`
      );
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.eventsService.remove(id);
  }

  // Add a test endpoint to check database connection
  @Get('test/connection')
  async testConnection() {
    try {
      const event = await this.eventsService.testDatabaseConnection();
      return {
        status: 'success',
        message: 'Database connection successful',
        test_event: event
      };
    } catch (error) {
      this.logger.error(`Database connection test failed: ${error.message}`, error.stack);
      return {
        status: 'error',
        message: `Database connection failed: ${error.message}`
      };
    }
  }
}