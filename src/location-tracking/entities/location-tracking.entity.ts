export interface LocationTracking {
    id?: string;           // Firestore auto-ID
    donorId: string;       // Reference to donor
    latitude: number;
    longitude: number;
    timestamp: Date;       // When the location was recorded
  }