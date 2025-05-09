// events.service.ts
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { Registration } from './entities/registration.entity';
import { Donor } from 'src/donor/entities/donor.entity';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,

    @InjectRepository(Donor)  // Inject Donor repository
    private donorRepository: Repository<Donor>,
  ) {}

 async findAll(filterDto?: EventFilterDto): Promise<Event[]> {
  const { search, isThisWeek, isWeekend, eventType, tags } = filterDto || {};
  
  // Build query
  const queryBuilder = this.eventsRepository.createQueryBuilder('event');
  
  // Only show published events by default
  queryBuilder.where('event.isPublished = :isPublished', { isPublished: true });
  
  // Important: Filter out past events by default (for "Upcoming" filter)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  // Use CONCAT to compare date+time, or just filter by date if no specific filter is applied
  if (!isThisWeek && !isWeekend) {
    queryBuilder.andWhere('event.eventDate >= :today', { today });
  }
  
  // Apply filters if provided
  if (search) {
    queryBuilder.andWhere(
      '(event.title ILIKE :search OR event.description ILIKE :search OR event.location ILIKE :search)',
      { search: `%${search}%` }
    );
  }
  
  if (isThisWeek === 'true') {
    queryBuilder.andWhere('event.isThisWeek = :isThisWeek', { isThisWeek: true });
    queryBuilder.andWhere('event.eventDate >= :today', { today }); // Only future events for This Week
  }
  
  if (isWeekend === 'true') {
    queryBuilder.andWhere('event.isWeekend = :isWeekend', { isWeekend: true });
    queryBuilder.andWhere('event.eventDate >= :today', { today }); // Only future events for Weekend
  }
  
  if (eventType) {
    queryBuilder.andWhere('event.eventType = :eventType', { eventType });
  }
  
  if (tags) {
    const tagList = Array.isArray(tags) ? tags : [tags];
    for (const tag of tagList) {
      queryBuilder.andWhere(':tag = ANY(event.tags)', { tag });
    }
  }
  
  // Order by date
  queryBuilder.orderBy('event.eventDate', 'ASC')
    .addOrderBy('event.startTime', 'ASC');
  
  return queryBuilder.getMany();
}

  async findNearbyEvents(latitude: number, longitude: number, radius: number = 10): Promise<Event[]> {
    // This is a simplified implementation
    // For a production app, you would use PostGIS or a similar spatial database extension
    // Or make a call to an external geolocation service
    
    // For now, we'll just return events with pre-calculated distances
    const events = await this.eventsRepository.find({
      where: { isPublished: true },
      order: { eventDate: 'ASC', startTime: 'ASC' },
    });
    
    // In a real implementation, we would calculate distance here
    // For now, using the stored distance value
    return events.filter(event => 
      event.distance !== null && event.distance <= radius
    );
  }

  async findThisWeekEvents(): Promise<Event[]> {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  return this.eventsRepository.find({
    where: {
      isPublished: true,
      eventDate: Between(today, nextWeek), // This ensures only future events
    },
    order: { eventDate: 'ASC', startTime: 'ASC' },
  });
}

async findWeekendEvents(): Promise<Event[]> {
  // Get current date info
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
  
  // Calculate upcoming weekend dates
  const nextSaturday = new Date(today);
  const nextSunday = new Date(today);
  
  if (dayOfWeek === 6) { // If today is Saturday
    nextSaturday.setDate(today.getDate());
    nextSunday.setDate(today.getDate() + 1);
  } else if (dayOfWeek === 0) { // If today is Sunday
    nextSaturday.setDate(today.getDate() - 1);
    nextSunday.setDate(today.getDate());
  } else { // If weekday
    nextSaturday.setDate(today.getDate() + (6 - dayOfWeek));
    nextSunday.setDate(today.getDate() + (7 - dayOfWeek));
  }
  
  // Set time to start/end of day
  nextSaturday.setHours(0, 0, 0, 0);
  nextSunday.setHours(23, 59, 59, 999);
  
  return this.eventsRepository.find({
    where: [
      { 
        isPublished: true, 
        eventDate: Between(nextSaturday, nextSunday),
        // This is already filtered for the upcoming weekend
      },
      { 
        isPublished: true, 
        isWeekend: true, 
        eventDate: MoreThanOrEqual(today), // This ensures only future weekend events
      },
    ],
    order: { eventDate: 'ASC', startTime: 'ASC' },
  });
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
    
    // Create a new event entity
    const newEvent = this.eventsRepository.create({
      ...createEventDto,
      
      // Calculate available spots
      availableSpots: (createEventDto.totalSpots || 0) - (createEventDto.registeredCount || 0),
      
      // Format event time information for display
      status: 'scheduled'
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
    
    // Check if event dates are being updated
    if (updateEventDto.eventDate) {
      // Determine if event is on weekend or this week
      const eventDate = new Date(updateEventDto.eventDate);
      const day = eventDate.getDay();
      updateEventDto.isWeekend = day === 0 || day === 6;
      
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      updateEventDto.isThisWeek = eventDate >= today && eventDate <= nextWeek;
    }
    
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

  // Add methods for checking event status and updating available spots
  async updateEventStatus(): Promise<void> {
    const now = new Date();
    
    // Update ongoing events
    await this.eventsRepository.update(
      {
        eventDate: LessThanOrEqual(now),
        status: 'scheduled',
      },
      { status: 'ongoing' }
    );
    
    // Update completed events
    await this.eventsRepository.createQueryBuilder()
      .update(Event)
      .set({ status: 'completed' })
      .where('eventDate < :date', { date: now })
      .andWhere('CONCAT(eventDate, \' \', endTime)::timestamp < :now', { now })
      .andWhere('status != :status', { status: 'cancelled' })
      .execute();
  }
  async registerForEvent(registerEventDto: RegisterEventDto): Promise<Event> {
    const { eventId, donorId } = registerEventDto;
  
    this.logger.log(`Donor ${donorId} is attempting to register for event ${eventId}`);
  
    try {
      const event = await this.eventsRepository.findOne({ where: { id: eventId } });
      const donor = await this.donorRepository.findOne({ where: { id: donorId } });

      // Check if event and donor exist
      if (!event) {
        this.logger.error(`Event with ID ${eventId} not found`);
        throw new NotFoundException('Event not found');
      }
  
      if (!donor) {
        this.logger.error(`Donor with ID ${donorId} not found`);
        throw new NotFoundException('Donor not found');
      }
  
      // Check if event has available spots
      if (event.availableSpots <= 0) {
        this.logger.error(`No available spots for event ${eventId}`);
        throw new BadRequestException('No available spots for this event');
      }
  
      // Register the donor and update available spots
      event.registeredCount += 1;
      event.availableSpots -= 1;
  
      // Create a registration record (to track the donor registering)
      const registration = new Registration();
      registration.event = event;
      registration.donor = donor;  // Associate donor with registration
      registration.registrationDate = new Date();
  
      // Save the registration
      await this.registrationRepository.save(registration);
  
      // Save the updated event entity to the database
      await this.eventsRepository.save(event);
      this.logger.log(`Donor ${donorId} successfully registered for event ${eventId}`);
  
      return event;
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw new BadRequestException('Could not register for the event');
    }
  }
}

