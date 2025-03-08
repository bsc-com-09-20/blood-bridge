import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { Donor } from './entities/donor.entity';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';

@Injectable()
export class DonorService {
  private readonly donorsCollection = 'donors';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createDonorDto: CreateDonorDto): Promise<Donor> {
    const firestore = this.firebaseService.getFirestore();
    const auth = this.firebaseService.getAuth();
    
    try {
      try {
        const userRecord = await auth.getUserByEmail(createDonorDto.email);
        if (userRecord) {
          throw new ConflictException('Email already exists');
        }
      } catch (error) {
        if (error instanceof ConflictException) throw error;
      }

      const userRecord = await auth.createUser({
        email: createDonorDto.email,
        password: createDonorDto.password,
        displayName: createDonorDto.name,
      });

      const lastDonation = createDonorDto.lastDonation || new Date().toISOString();

      const newDonor: Omit<Donor, 'password'> = {
        name: createDonorDto.name,
        email: createDonorDto.email,
        bloodGroup: createDonorDto.bloodGroup,
        phone: createDonorDto.phone,
        lastDonation,
      };

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

  async findOne(id: string): Promise<Donor> {
    const firestore = this.firebaseService.getFirestore();
    const donorDoc = await firestore.collection(this.donorsCollection).doc(id).get();
    
    if (!donorDoc.exists) {
      throw new NotFoundException('Donor not found');
    }

    return { id: donorDoc.id, ...donorDoc.data() } as Donor;
  }

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

  async update(id: string, updateDonorDto: UpdateDonorDto): Promise<Donor> {
    const firestore = this.firebaseService.getFirestore();
    const auth = this.firebaseService.getAuth();
    
    try {
      const donorRef = firestore.collection(this.donorsCollection).doc(id);
      const donorDoc = await donorRef.get();
      
      if (!donorDoc.exists) {
        throw new NotFoundException('Donor not found');
      }

      if (updateDonorDto.email) {
        await auth.updateUser(id, { email: updateDonorDto.email, displayName: updateDonorDto.name || undefined });
      } else if (updateDonorDto.name) {
        await auth.updateUser(id, { displayName: updateDonorDto.name });
      }

      await donorRef.set(updateDonorDto, { merge: true });

      const updatedDonorDoc = await donorRef.get();
      return { id: updatedDonorDoc.id, ...updatedDonorDoc.data() } as Donor;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to update donor: ${error.message}`);
    }
  }

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

  async getEligibleDonors(): Promise<Donor[]> {
    const donors = await this.findAll();
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return donors.filter(donor => {
      const lastDonationDate = this.parseLastDonationDate(donor.lastDonation);
      return lastDonationDate <= threeMonthsAgo;
    });
  }
  
  private parseLastDonationDate(lastDonation: string): Date {
    return new Date(lastDonation);

  }
}
