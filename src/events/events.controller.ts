import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpCode, 
  HttpStatus, 
  InternalServerErrorException, 
  Logger, 
  BadRequestException, 
  Query 
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { Public } from 'src/auth/auth.guard';

@Controller('events')
@Public()
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Query() filterDto: EventFilterDto): Promise<Event[]> {
    this.logger.log(`Finding events with filters: ${JSON.stringify(filterDto)}`);
    return this.eventsService.findAll(filterDto);
  }

  @Get('nearby')
  async findNearbyEvents(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
    @Query('radius') radius: string = '10',
  ): Promise<Event[]> {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      throw new BadRequestException('Invalid latitude, longitude, or radius values');
    }

    this.logger.log(`Finding nearby events at coordinates: (${lat}, ${lng}), radius: ${rad}`);
    return this.eventsService.findNearbyEvents(lat, lng, rad);
  }

  @Get('this-week')
  async findThisWeekEvents(): Promise<Event[]> {
    this.logger.log('Finding events for this week');
    return this.eventsService.findThisWeekEvents();
  }

  @Get('weekend')
  async findWeekendEvents(): Promise<Event[]> {
    this.logger.log('Finding weekend events');
    return this.eventsService.findWeekendEvents();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event> {
    this.logger.log(`Finding event with ID: ${id}`);
    return this.eventsService.findOne(id);
  }

  @Post()
  async create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    this.logger.log(`Attempting to create event: ${JSON.stringify(createEventDto)}`);
    
    // Validate required fields
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

      // Validate time fields
      if (!createEventDto.startTime || !createEventDto.endTime) {
        throw new BadRequestException('Start time and end time are required');
      }

      // Calculate available spots
      if (createEventDto.totalSpots !== undefined) {
        createEventDto.availableSpots = createEventDto.totalSpots - (createEventDto.registeredCount || 0);
      }
      
      // Determine if event is on weekend or this week
      const eventDate = new Date(createEventDto.eventDate);
      const day = eventDate.getDay();
      createEventDto.isWeekend = day === 0 || day === 6;
      
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      createEventDto.isThisWeek = eventDate >= today && eventDate <= nextWeek;
      
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
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    this.logger.log(`Updating event ${id} with data: ${JSON.stringify(updateEventDto)}`);
    
    // Update availability if needed
    if (updateEventDto.totalSpots !== undefined || updateEventDto.registeredCount !== undefined) {
      const currentEvent = await this.eventsService.findOne(id);
      const totalSpots = updateEventDto.totalSpots ?? currentEvent.totalSpots;
      const registeredCount = updateEventDto.registeredCount ?? currentEvent.registeredCount;
      updateEventDto.availableSpots = totalSpots - registeredCount;
    }
    
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Removing event with ID: ${id}`);
    return this.eventsService.remove(id);
  }

  // New Registration Endpoint
  @Post('register')
  async registerForEvent(
    @Body() registerEventDto: RegisterEventDto,
  ): Promise<Event> {
    const { eventId, donorId } = registerEventDto;

    this.logger.log(`User ${donorId} is attempting to register for event ${eventId}`);

    try {
      // Validate that both IDs are provided
      if (!eventId || !donorId) {
        throw new BadRequestException('Both eventId and donorId are required');
      }

      const event = await this.eventsService.registerForEvent(registerEventDto);
      this.logger.log(`User ${donorId} successfully registered for event ${eventId}`);
      
      return event;
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Could not register for the event');
    }
  }
}