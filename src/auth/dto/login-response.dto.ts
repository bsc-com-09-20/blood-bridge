// Adjusted to support both Donor and Hospital users

export class LoginResponseDto {
    access_token: string;
  
    user: {
      id: string;
      email: string;
      name: string;
      bloodGroup?: string; // Donor only
      phone?: string;      // Donor only
      lastDonation?: Date; // Donor only
      latitude?: number;   // Hospital only
      longitude?: number;  // Hospital only
      location?: any;      // Donor location (GeoJSON)
    };
  
    role: 'donor' | 'hospital';
  }
  