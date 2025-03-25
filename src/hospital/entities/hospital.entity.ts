export interface Hospital {
    id: string;
    name: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    location: {
      latitude: number;
      longitude: number;
    };
    bloodTypeNeeded: string;
    bloodRequests: BloodRequest[];
    preferredDonors: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface BloodRequest {
    requestId: string;
    bloodType: string;
    quantity: number;
    status: 'pending' | 'fulfilled' | 'cancelled';
    createdAt: string;
    updatedAt: string;
  }