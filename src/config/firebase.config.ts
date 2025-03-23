import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Parse the JSON string from .env
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

// Export Firebase Admin SDK
export default admin;
