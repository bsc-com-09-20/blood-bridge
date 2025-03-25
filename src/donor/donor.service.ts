import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateLocationTrackingDto } from '../location-tracking/dto/update-location-tracking.dto';
import { Donor } from './entities/donor.entity';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';

@Injectable()
export class DonorService {
  private readonly donorsCollection = 'donors';
  private readonly locationCollection = 'locationTracking';
  private readonly minDonationInterval = 3; // months

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Creates a new donor with email uniqueness check
   */
  async createDonor(createDonorDto: CreateDonorDto): Promise<Donor> {
    const { email, password, name } = createDonorDto;
    const firestore = this.firebaseService.getFirestore();
    const auth = this.firebaseService.getAuth();

    try {
      // Check for existing email
      try {
        await auth.getUserByEmail(email);
        throw new ConflictException('Email already registered');
      } catch (error) {
        if (error.code !== 'auth/user-not-found') throw error;
      }

      // Create auth user
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
        disabled: false
      });

      // Prepare donor data
      const donorData: Omit<Donor, 'id'> = {
        name,
        email,
        bloodGroup: createDonorDto.bloodGroup,
        phone: createDonorDto.phone,
        lastDonation: createDonorDto.lastDonation || new Date().toISOString(),
        isActive: true,
        location: null,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      await firestore.collection(this.donorsCollection)
        .doc(userRecord.uid)
        .set(donorData);

      return { id: userRecord.uid, ...donorData };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to create donor');
    }
  }

  /**
   * Updates donor location (with timestamp)
   */
  async updateLocation(donorId: string, updateLocationDto: UpdateLocationTrackingDto): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    const batch = firestore.batch();

    const donorRef = firestore.collection(this.donorsCollection).doc(donorId);
    const locationRef = firestore.collection(this.locationCollection).doc();

    const locationData = {
      ...updateLocationDto,
      donorId,
      timestamp: new Date().toISOString()
    };

    // Update both donor record and location history in transaction
    batch.update(donorRef, { location: updateLocationDto });
    batch.set(locationRef, locationData);

    try {
      await batch.commit();
    } catch (error) {
      throw new NotFoundException('Donor not found or update failed');
    }
  }

  /**
   * Finds donors with optional filters
   */
  async findAll(filterDto?: FilterDonorDto): Promise<Donor[]> {
    const firestore = this.firebaseService.getFirestore();
    let query = firestore.collection(this.donorsCollection).where('isActive', '==', true);

    if (filterDto?.bloodGroup) {
      query = query.where('bloodGroup', '==', filterDto.bloodGroup);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Donor));
  }

  /**
   * Gets donor by ID with existence check
   */
  async findOne(id: string): Promise<Donor> {
    const doc = await this.firebaseService.getFirestore()
      .collection(this.donorsCollection)
      .doc(id)
      .get();

    if (!doc.exists) throw new NotFoundException('Donor not found');
    return { id: doc.id, ...doc.data() } as Donor;
  }

  /**
   * Updates donor profile with auth sync
   */
  async update(id: string, updateDonorDto: UpdateDonorDto): Promise<Donor> {
    const firestore = this.firebaseService.getFirestore();
    const auth = this.firebaseService.getAuth();

    try {
      // Update Auth first
      const authUpdates = {};
      if (updateDonorDto.email) authUpdates['email'] = updateDonorDto.email;
      if (updateDonorDto.name) authUpdates['displayName'] = updateDonorDto.name;
      
      if (Object.keys(authUpdates).length > 0) {
        await auth.updateUser(id, authUpdates);
      }

      // Then update Firestore
      await firestore.collection(this.donorsCollection)
        .doc(id)
        .set(updateDonorDto, { merge: true });

      return this.findOne(id);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new NotFoundException('Donor not found');
      }
      throw new InternalServerErrorException('Update failed');
    }
  }

  /**
   * Gets eligible donors (last donation > 3 months ago)
   */
  async getEligibleDonors(): Promise<Donor[]> {
    const donors = await this.findAll();
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - this.minDonationInterval);

    return donors.filter(donor => {
      const lastDonationDate = new Date(donor.lastDonation);
      return lastDonationDate <= cutoffDate;
    });
  }

  /**
 * Finds a donor by email (case-sensitive exact match)
 */
async findByEmail(email: string): Promise<Donor | null> {
  const firestore = this.firebaseService.getFirestore();
  
  try {
    const snapshot = await firestore.collection(this.donorsCollection)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { 
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email,
      bloodGroup: doc.data().bloodGroup,
      phone: doc.data().phone,
      lastDonation: doc.data().lastDonation,
      isActive: doc.data().isActive,
      location: doc.data().location,
      createdAt: doc.data().createdAt
    } as Donor;
  } catch (error) {
    throw new InternalServerErrorException('Failed to find donor by email');
  }
}

  /**
   * Deletes donor with cleanup
   */
  async remove(id: string): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    const auth = this.firebaseService.getAuth();

    try {
      // Soft delete (recommended instead of hard delete)
      await firestore.collection(this.donorsCollection)
        .doc(id)
        .update({ isActive: false });

      // Optionally disable auth account
      await auth.updateUser(id, { disabled: true });
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 5) {
        throw new NotFoundException('Donor not found');
      }
      throw new InternalServerErrorException('Deletion failed');
    }
  }
}