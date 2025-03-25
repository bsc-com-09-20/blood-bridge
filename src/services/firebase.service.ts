import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (admin.apps.length > 0) {
      this.firebaseApp = admin.apps[0]!;
      return;
    }

    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!privateKey) {
      throw new Error('Firebase private key is not configured properly');
    }

    try {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: privateKey,
        }),
        databaseURL: `https://${this.configService.get<string>(
          'FIREBASE_PROJECT_ID'
        )}.firebaseio.com`,
      });
      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.error('Firebase initialization failed', error.stack);
      throw error;
    }
  }

  getFirestore(): admin.firestore.Firestore {
    return admin.firestore(this.firebaseApp);
  }

  getAuth(): admin.auth.Auth {
    return admin.auth(this.firebaseApp);
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.getAuth().verifyIdToken(token);
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw error;
    }
  }
}