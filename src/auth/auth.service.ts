import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(private firebaseService: FirebaseService) {}

  async verifyToken(token: string) {
    try {
      const decodedToken = await this.firebaseService.getAuth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserRole(uid: string): Promise<string> {
    const firestore = this.firebaseService.getFirestore();

    // Check donor collection
    const donorDoc = await firestore.collection('donors').doc(uid).get();
    if (donorDoc.exists) return 'donor';

    // Check hospital collection
    const hospitalDoc = await firestore.collection('hospitals').doc(uid).get();
    if (hospitalDoc.exists) return 'hospital';

    return 'unknown';
  }
}
