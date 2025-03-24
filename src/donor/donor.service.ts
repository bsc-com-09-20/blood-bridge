import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateLocationDto } from '../location-tracking/dto/update-location.dto';
import { Donor } from './entities/donor.entity';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';

@Injectable()
export class DonorService {
  private readonly donorsCollection = 'donors';

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Creates a new donor.
   */
  async createDonor(createDonorDto: CreateDonorDto): Promise<Donor> {
    const firestore = this.firebaseService.getFirestore();
    const auth = this.firebaseService.getAuth();

    try {
      // Check if email already exists
      try {
        const userRecord = await auth.getUserByEmail(createDonorDto.email);
        if (userRecord) {
          throw new ConflictException('Email already exists');
        }
      } catch (error) {
        if (error instanceof ConflictException) throw error;
      }

      // Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: createDonorDto.email,
        password: createDonorDto.password,
        displayName: createDonorDto.name,
      });

      // Set last donation date
      const lastDonation = createDonorDto.lastDonation || new Date().toISOString();

      const newDonor: Omit<Donor, 'password'> = {
        name: createDonorDto.name,
        email: createDonorDto.email,
        bloodGroup: createDonorDto.bloodGroup,
        phone: createDonorDto.phone,
        lastDonation,
        isActive: true,
      };

      // Store donor in Firestore
      await firestore.collection(this.donorsCollection).doc(userRecord.uid).set(newDonor);

      return {
        id: userRecord.uid,
        ...newDonor,
      } as Donor;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new Error(`Failed to create donor: ${error.message}`);
    }
  }

  /**
   * Updates donor's location.
   */
  async updateLocation(donorId: string, updateLocationDto: UpdateLocationDto): Promise<{ status: string }> {
    const firestore = this.firebaseService.getFirestore();
    const donorRef = firestore.collection(this.donorsCollection).doc(donorId);

    const donorDoc = await donorRef.get();
    if (!donorDoc.exists) {
      throw new NotFoundException('Donor not found');
    }

    await donorRef.update({ location: updateLocationDto });
    return { status: 'Location updated' };
  }

  /**
   * Retrieves all donors with optional filtering.
   */
  async findAll(filterDto?: FilterDonorDto): Promise<Donor[]> {
    const firestore = this.firebaseService.getFirestore();
    let query = firestore.collection(this.donorsCollection);

    const snapshot = await query.get();
    if (snapshot.empty) return [];

    let donors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Donor[];

    if (filterDto?.name) {
      const nameLower = filterDto.name.toLowerCase();
      donors = donors.filter(donor => donor.name.toLowerCase().includes(nameLower));
    }

    if (filterDto?.bloodGroup) {
      donors = donors.filter(donor => donor.bloodGroup === filterDto.bloodGroup);
    }

    return donors;
  }

  /**
   * Retrieves a donor by ID.
   */
  async findOne(id: string): Promise<Donor> {
    const firestore = this.firebaseService.getFirestore();
    const donorDoc = await firestore.collection(this.donorsCollection).doc(id).get();

    if (!donorDoc.exists) {
      throw new NotFoundException('Donor not found');
    }

    return { id: donorDoc.id, ...donorDoc.data() } as Donor;
  }

  /**
   * Retrieves a donor by email.
   */
  async findByEmail(email: string): Promise<Donor | null> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore.collection(this.donorsCollection)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Donor;
  }

  /**
   * Updates donor information.
   */
  async update(id: string, updateDonorDto: UpdateDonorDto): Promise<Donor> {
    const firestore = this.firebaseService.getFirestore();
    const auth = this.firebaseService.getAuth();

    try {
      const donorRef = firestore.collection(this.donorsCollection).doc(id);
      const donorDoc = await donorRef.get();

      if (!donorDoc.exists) {
        throw new NotFoundException('Donor not found');
      }

      // Update Firebase Authentication
      if (updateDonorDto.email) {
        await auth.updateUser(id, { email: updateDonorDto.email, displayName: updateDonorDto.name || undefined });
      } else if (updateDonorDto.name) {
        await auth.updateUser(id, { displayName: updateDonorDto.name });
      }

      // Merge updates into Firestore
      await donorRef.set(updateDonorDto, { merge: true });

      const updatedDonorDoc = await donorRef.get();
      return { id: updatedDonorDoc.id, ...updatedDonorDoc.data() } as Donor;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to update donor: ${error.message}`);
    }
  }

  /**
   * Deletes a donor.
   */
  async remove(id: string): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    const auth = this.firebaseService.getAuth();

    try {
      const donorRef = firestore.collection(this.donorsCollection).doc(id);
      const donorDoc = await donorRef.get();

      if (!donorDoc.exists) {
        throw new NotFoundException('Donor not found');
      }

      await donorRef.delete();
      await auth.deleteUser(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to delete donor: ${error.message}`);
    }
  }

  /**
   * Retrieves donors eligible for donation (last donation was at least 3 months ago).
   */
  async getEligibleDonors(): Promise<Donor[]> {
    const donors = await this.findAll();

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return donors.filter(donor => {
      const lastDonationDate = this.parseLastDonationDate(donor.lastDonation);
      return lastDonationDate <= threeMonthsAgo;
    });
  }

  /**
   * Parses last donation date.
   */
  private parseLastDonationDate(lastDonation: string): Date {
    return new Date(lastDonation);
  }
}
