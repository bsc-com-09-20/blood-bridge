import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { Hospital, BloodRequest } from './entities/hospital.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HospitalService {
  private readonly collection = 'hospitals';

  constructor(private readonly firebaseService: FirebaseService) {}

  async createHospital(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    const firestore = this.firebaseService.getFirestore();
    const hospitalId = uuidv4();

    const hospitalData: Hospital = {
      id: hospitalId,
      name: createHospitalDto.name,
      address: createHospitalDto.address,
      contactEmail: createHospitalDto.contactEmail,
      contactPhone: createHospitalDto.contactPhone,
      location: createHospitalDto.location,
      bloodTypeNeeded: createHospitalDto.bloodTypeNeeded,
      bloodRequests: [],
      preferredDonors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await firestore.collection(this.collection)
        .doc(hospitalId)
        .set(hospitalData);
      return hospitalData;
    } catch (error) {
      throw new ConflictException('Hospital creation failed');
    }
  }

  async getHospitalById(id: string): Promise<Hospital> {
    const firestore = this.firebaseService.getFirestore();
    const doc = await firestore.collection(this.collection).doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    return {
      id: doc.id,
      ...doc.data()
    } as Hospital;
  }

  async updateHospital(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {
    const firestore = this.firebaseService.getFirestore();
    const hospitalRef = firestore.collection(this.collection).doc(id);

    const updateData = {
      ...updateHospitalDto,
      updatedAt: new Date().toISOString()
    };

    try {
      await hospitalRef.update(updateData);
      const updatedDoc = await hospitalRef.get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Hospital;
    } catch (error) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
  }

  async createBloodRequest(hospitalId: string, bloodType: string, quantity: number): Promise<BloodRequest> {
    const firestore = this.firebaseService.getFirestore();
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    const requestData: BloodRequest = {
      requestId,
      bloodType,
      quantity,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await firestore.collection(this.collection)
      .doc(hospitalId)
      .update({
        bloodRequests: admin.firestore.FieldValue.arrayUnion(requestData),
        updatedAt: timestamp
      });

    return requestData;
  }

  async findNearbyDonors(hospitalId: string, radiusKm: number) {
    const hospital = await this.getHospitalById(hospitalId);
    const firestore = this.firebaseService.getFirestore();

    const donorsSnapshot = await firestore.collection('donors')
      .where('bloodGroup', '==', hospital.bloodTypeNeeded)
      .get();

    return donorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}