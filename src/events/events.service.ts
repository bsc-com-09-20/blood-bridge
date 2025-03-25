/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { FilterEventDto } from './dto/filter-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  private readonly eventsCollection = 'events';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const firestore = this.firebaseService.getFirestore();
    
    try {
      // Check if an event with the same title and date already exists to avoid duplicates
      const snapshot = await firestore.collection(this.eventsCollection)
        .where('title', '==', createEventDto.title)
        .where('date', '==', createEventDto.date)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        throw new ConflictException('An event with the same title and date already exists');
      }

      const newEvent: Omit<Event, 'id'> = {
        title: createEventDto.title,
        description: createEventDto.description,
        date: createEventDto.date,
        location: createEventDto.location,
      };

      // Let Firestore auto-generate an ID for the new event
      const docRef = await firestore.collection(this.eventsCollection).add(newEvent);

      return {
        // Convert the Firestore-generated string ID to a number
        id: parseInt(docRef.id, 10),
        ...newEvent,
      } as Event;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  async findAll(filterDto?: FilterEventDto): Promise<Event[]> {
    const firestore = this.firebaseService.getFirestore();
    const query = firestore.collection(this.eventsCollection);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) return [];

    let events = snapshot.docs.map(doc => ({
      id: parseInt(doc.id, 10),
      ...doc.data(),
    })) as Event[];

    // Update filter: use 'title' instead of a non-existent 'name' property
    if (filterDto?.title) {
      const titleLower = filterDto.title.toLowerCase();
      events = events.filter(event => event.title.toLowerCase().includes(titleLower));
    }

    if (filterDto?.date) {
      events = events.filter(event => event.date === filterDto.date);
    }

    return events;
  }

  async findOne(id: string): Promise<Event> {
    const firestore = this.firebaseService.getFirestore();
    const eventDoc = await firestore.collection(this.eventsCollection).doc(id).get();
    
    if (!eventDoc.exists) {
      throw new NotFoundException('Event not found');
    }

    return { id: parseInt(eventDoc.id, 10), ...eventDoc.data() } as Event;
  }

  async findByTitle(title: string): Promise<Event | null> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore.collection(this.eventsCollection)
      .where('title', '==', title)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: parseInt(doc.id, 10), ...doc.data() } as Event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const firestore = this.firebaseService.getFirestore();
    
    try {
      const eventRef = firestore.collection(this.eventsCollection).doc(id);
      const eventDoc = await eventRef.get();
      
      if (!eventDoc.exists) {
        throw new NotFoundException('Event not found');
      }

      // Check for duplicate title if title is being updated
      if (updateEventDto.title) {
        const existingEvent = await this.findByTitle(updateEventDto.title);
        if (existingEvent && existingEvent.id !== parseInt(id, 10)) {
          throw new ConflictException('An event with this title already exists');
        }
      }

      await eventRef.set(updateEventDto, { merge: true });

      const updatedEventDoc = await eventRef.get();
      return { id: parseInt(updatedEventDoc.id, 10), ...updatedEventDoc.data() } as Event;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    
    try {
      const eventRef = firestore.collection(this.eventsCollection).doc(id);
      const eventDoc = await eventRef.get();
      
      if (!eventDoc.exists) {
        throw new NotFoundException('Event not found');
      }

      await eventRef.delete();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  /**
   * Returns all events whose event date is in the future (upcoming events).
   */
  async getUpcomingEvents(): Promise<Event[]> {
    const events = await this.findAll();
    const now = new Date();
    
    return events.filter(event => {
      // Ensure event.date is a string before parsing
      const eventDate = this.parseEventDate(
        event.date instanceof Date ? event.date.toISOString() : event.date
      );
      return eventDate >= now;
    });
  }
  
  /**
   * Returns all events that occurred in the past.
   */
  async getPastEvents(): Promise<Event[]> {
    const events = await this.findAll();
    const now = new Date();
    
    return events.filter(event => {
      const eventDate = this.parseEventDate(
        event.date instanceof Date ? event.date.toISOString() : event.date
      );
      return eventDate < now;
    });
  }
  
  /**
   * Returns events happening in the next n days.
   */
  async getEventsInNextDays(days: number): Promise<Event[]> {
    const events = await this.findAll();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return events.filter(event => {
      const eventDate = this.parseEventDate(
        event.date instanceof Date ? event.date.toISOString() : event.date
      );
      return eventDate >= now && eventDate <= futureDate;
    });
  }
  
  private parseEventDate(eventDate: string): Date {
    return new Date(eventDate);
  }
}
