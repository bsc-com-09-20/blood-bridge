export class Donor {
    id?: string;
    name: string;
    bloodGroup: string;
    lastDonation: string;
    email: string;
    phone: string;
    password?: string;
    isActive: boolean;
    location: {
      latitude: number;
      longitude: number;
    } | null;  
    createdAt: string
  }

  