import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;
  private firestore: admin.firestore.Firestore;
  private auth: admin.auth.Auth;

  constructor() {
    const serviceAccountPath = process.env.FIREBASE_CREDENTIALS;

    if (!serviceAccountPath) {
      throw new Error('FIREBASE_CREDENTIALS environment variable is not set.');
    }

    const absolutePath = path.resolve(serviceAccountPath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Firebase service account file not found at ${absolutePath}`);
    }

    if (admin.apps.length === 0) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(require(absolutePath)),
      });
    } else {
      this.firebaseApp = admin.app();
    }

    this.firestore = this.firebaseApp.firestore();
    this.auth = this.firebaseApp.auth();
  }

  getAuth() {
    return this.auth;
  }

  getFirestore() {
    return this.firestore;
  }

  // This method exists to provide compatibility with the donor service
  getCollection(collectionName: string) {
    return this.firestore.collection(collectionName);
  }

  /**
   * Verify Firebase Auth Token
   */
  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.auth.verifyIdToken(token);
    } catch (error) {
      throw new Error('Invalid or expired token.');
    }
  }

  /**
   * Get User Role (Donor or Hospital)
   */
  async getUserRole(uid: string): Promise<string> {
    const donorDoc = await this.firestore.collection('donors').doc(uid).get();
    if (donorDoc.exists) return 'donor';

    const hospitalDoc = await this.firestore.collection('hospitals').doc(uid).get();
    if (hospitalDoc.exists) return 'hospital';

    return 'unknown';
  }
}