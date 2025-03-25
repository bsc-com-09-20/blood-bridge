import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { LocationTracking } from './entities/location-tracking.entity';
import {CreateLocationTrackingDto } from '../location-tracking/dto/create-location-tracking.dto';
import {UpdateLocationTrackingDto} from '../location-tracking/dto/update-location-tracking.dto';

@Injectable()
export class LocationTrackingService {
  private readonly collection = 'locationTracking';

  constructor(private firebaseService: FirebaseService) {}

  async createLocation(data: CreateLocationTrackingDto): Promise<LocationTracking> {
    const firestore = this.firebaseService.getFirestore();
    const docRef = firestore.collection(this.collection).doc();
    const locationData: LocationTracking = {
      ...data,
      timestamp: new Date(),
    };
    await docRef.set(locationData);
    return { id: docRef.id, ...locationData };
  }

  async updateLocation(donorId: string, data: UpdateLocationTrackingDto): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection(this.collection)
      .where('donorId', '==', donorId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error('No location found for donor');
    }

    const docRef = snapshot.docs[0].ref;
    await docRef.update({ ...data, timestamp: new Date() });
  }
}