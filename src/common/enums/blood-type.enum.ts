export enum BloodType {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
    ALL = 'ALL'
  }
  export function bloodTypeToString(bloodType: BloodType): string {
    return bloodType === BloodType.ALL ? 'all blood types' : 
      bloodType.toLowerCase().replace('_', '+');
  }
  