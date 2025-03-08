export class Donor {
    id?: string;
    name: string;
    bloodGroup: string;
    lastDonation: string;
    email: string;
    phone: string;
    password?: string; // Not stored in Firestore, only used for initial creation
  }
