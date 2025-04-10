/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    
    return event;
  }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    this.logger.log(`Creating event with data: ${JSON.stringify(createEventDto)}`);
    
    // Create a new event entity and map properties from DTO
    const newEvent = this.eventsRepository.create({
      title: createEventDto.title,
      description: createEventDto.description,
      eventDate: createEventDto.eventDate,
      location: createEventDto.location,
      isPublished: createEventDto.isPublished ?? false // Default to false if not provided
    });
    
    this.logger.debug(`Event entity prepared: ${JSON.stringify(newEvent)}`);
    
    // Save to database and return the saved entity
    try {
      const savedEvent = await this.eventsRepository.save(newEvent);
      this.logger.log(`Event saved successfully with ID: ${savedEvent.id}`);
      return savedEvent;
    } catch (error) {
      this.logger.error(`Error saving event to database: ${error.message}`, error.stack);
      throw error; // Let controller handle specific error responses
    }
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    
    // Update the event with the provided data
    Object.assign(event, updateEventDto);
    
    return this.eventsRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  // Add a method to test database connection
  async testDatabaseConnection(): Promise<any> {
    try {
      // Simple query to check connection
      await this.eventsRepository.query('SELECT 1 as connection_test');
      
      // Try to create a test event
      const testEvent = this.eventsRepository.create({
        title: 'Database Test Event',
        description: 'This event was created to test database connectivity',
        eventDate: new Date(),
        isPublished: false
      });
      
      // Save but don't actually commit to database
      return testEvent;
    } catch (error) {
      this.logger.error('Database connection test failed', error.stack);
      throw error;
    }
  }
}