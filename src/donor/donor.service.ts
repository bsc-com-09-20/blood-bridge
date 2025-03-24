import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../services/firebase.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateLocationDto } from '../location-tracking/dto/update-location.dto';

@Injectable()
export class DonorsService {
  constructor(private firebaseService: FirebaseService) {}

  async createDonor(createDonorDto: CreateDonorDto) {
    const firestore = this.firebaseService.getFirestore();
    const donorRef = firestore.collection('donors').doc();
    await donorRef.set({
      ...createDonorDto,
      isActive: true,
    });
    return { donorId: donorRef.id };
  }

  async updateLocation(donorId: string, updateLocationDto: UpdateLocationDto) {
    const firestore = this.firebaseService.getFirestore();
    const donorRef = firestore.collection('donors').doc(donorId);
    await donorRef.update({ location: updateLocationDto });
    return { status: 'Location updated' };
  }
}