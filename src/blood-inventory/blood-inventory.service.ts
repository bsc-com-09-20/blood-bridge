import { Injectable } from '@nestjs/common';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';
import { UpdateBloodInventoryDto } from './dto/update-blood-inventory.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class BloodInventoryService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // Create a new blood inventory record
  async create(createBloodInventoryDto: CreateBloodInventoryDto) {
    const bloodInventoryRef = this.firebaseService.getFirestore().collection('blood_inventory');

    // Generate a unique Firestore ID
    const newDocRef = bloodInventoryRef.doc();
    const id = newDocRef.id; // Firestore auto-generated string ID

    // Add data to Firestore
    const newInventory = {
      id,
      ...createBloodInventoryDto,
    };

    await newDocRef.set(newInventory);
    return newInventory;
  }

  // Get all blood inventory records
  async findAll() {
    const snapshot = await this.firebaseService.getFirestore().collection('blood_inventory').get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return data ? { id: doc.id, ...data } : null;
    }).filter(item => item !== null);
  }

  // Get a single blood inventory record by ID
  async findOne(id: string) {
    const docRef = this.firebaseService.getFirestore()
      .collection('blood_inventory')
      .doc(id)
      .get();

    if (!(await docRef).exists) return null;

    return { id, ...(await docRef).data() };
  }

  // Update a blood inventory record by ID
  async update(id: string, updateBloodInventoryDto: UpdateBloodInventoryDto) {
    const docRef = this.firebaseService.getFirestore()
      .collection('blood_inventory')
      .doc(id);

    const doc = await docRef.get();
    if (!doc.exists) throw new Error('Document not found');

    // Apply the update
    await docRef.update({ ...updateBloodInventoryDto });

    // Get updated document
    const updatedDoc = await docRef.get();
    return { id, ...updatedDoc.data() };
  }

  // Delete a blood inventory record by ID
  async remove(id: string) {
    const docRef = this.firebaseService.getFirestore()
      .collection('blood_inventory')
      .doc(id);

    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.delete();
    return { id, ...doc.data() };
  }
}
