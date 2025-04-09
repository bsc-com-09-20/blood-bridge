import { BloodType } from 'src/common/enums/blood-type.enum';

export class CreateBloodRequestDto {
  // Required fields
  bloodType: BloodType;
  
  // Optional fields
  hospitalId?: number; // To link with hospital
  donorId?: string;    // To link with donor (might be assigned later)
  status?: string;     // Default is 'pending' in entity
  distanceKm: number;  // This would be calculated based on donor and hospital distance
  
  // Add radius here to fix the error
  radius: number;      // Radius to search for compatible donors
}
