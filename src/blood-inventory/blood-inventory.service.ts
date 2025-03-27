import { Injectable } from '@nestjs/common';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';
import { UpdateBloodInventoryDto } from './dto/update-blood-inventory.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class BloodInventoryService {
  private currentId: number = 1; // Start from 1

  constructor(private readonly firebaseService: FirebaseService) {}

  // Create a new blood inventory record
  async create(createBloodInventoryDto: CreateBloodInventoryDto) {
    const bloodInventoryRef = this.firebaseService.getFirestore().collection('blood_inventory');

    // Assign a numeric ID manually
    const id = this.currentId++;

    // Add data to Firestore
    await bloodInventoryRef.doc(id.toString()).set({
      ...createBloodInventoryDto,
      id, // Store 'id' in the document
    });

    return { id, ...createBloodInventoryDto };
  }

  // Get all blood inventory records
  async findAll() {
    const snapshot = await this.firebaseService.getFirestore().collection('blood_inventory').get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return data ? { id: data.id, ...data } : null; // Ensure data exists
    }).filter(item => item !== null); // Remove any null values
  }

  // Get a single blood inventory record by ID
  async findOne(id: number) {
    const docRef = await this.firebaseService.getFirestore()
      .collection('blood_inventory')
      .doc(id.toString())
      .get();

    if (!docRef.exists) return null;

    const data = docRef.data();
    return data ? { id: data.id, ...data } : null;
  }

  // Update a blood inventory record by ID
  async update(id: number, updateBloodInventoryDto: UpdateBloodInventoryDto) {
    const docRef = this.firebaseService.getFirestore()
      .collection('blood_inventory')
      .doc(id.toString());

    const doc = await docRef.get();
    if (!doc.exists) throw new Error('Document not found');

    // Update the document safely
    await docRef.update({ ...updateBloodInventoryDto });

    // Get updated document
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();
    if (!updatedData) throw new Error('Document update failed'); 

    return { id: updatedData.id, ...updatedData };
  }

  // Delete a blood inventory record by ID
  async remove(id: number) {
    const docRef = this.firebaseService.getFirestore()
      .collection('blood_inventory')
      .doc(id.toString());

    const doc = await docRef.get();
    if (!doc.exists) return null;

    const data = doc.data();
    if (!data) return null;

    await docRef.delete();
    
    return { id: data.id, ...data };
  }
}
