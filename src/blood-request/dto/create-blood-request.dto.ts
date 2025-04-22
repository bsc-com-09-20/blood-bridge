import { BloodType } from 'src/common/enums/blood-type.enum';

export class CreateBloodRequestDto {
  bloodType: BloodType;
  radius: number;      
  quantity: number;    
  hospitalId?: string; 
  broadcastAll?: boolean;
  
}

