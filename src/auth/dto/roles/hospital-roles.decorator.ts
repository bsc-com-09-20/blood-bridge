import { SetMetadata } from '@nestjs/common';

export const HospitalOnly = () => SetMetadata('role', 'hospital');