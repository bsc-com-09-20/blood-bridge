// This should be defined in a shared types file or in your auth module

export interface AuthUser {
    id: string;
    email: string;
    role: string;
    hospitalId?: string;  // For hospital staff
    donorId?: string;     // For donors
    bloodType?: string;   // For donors
  }
  
  // Example of how to extend the Express Request interface
  // Place this in a types declaration file (e.g., types.d.ts)
  