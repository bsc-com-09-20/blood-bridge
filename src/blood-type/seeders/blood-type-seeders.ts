// src/blood-type/seeders/blood-group-seeder.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodGroup } from '../blood-type/entities/blood-group.entity';

@Injectable()
export class BloodGroupSeederService {
  constructor(
    @InjectRepository(BloodGroup)
    private bloodGroupRepository: Repository<BloodGroup>,
  ) {}

  async seedBloodGroups() {
    const bloodGroups = [
      {
        bloodGroup: 'A+',
        description: 'Type A positive blood has A antigens on red blood cells and anti-B antibodies in plasma. The Rh factor is positive. This is the second most common blood type, found in about 34% of the population.',
        canDonateTo: 'A+, AB+',
        canReceiveFrom: 'A+, A-, O+, O-'
      },
      {
        bloodGroup: 'A-',
        description: 'Type A negative blood has A antigens on red blood cells and anti-B antibodies in plasma. The Rh factor is negative. This blood type is found in about 6% of the population and is valuable for donations to Rh-negative recipients.',
        canDonateTo: 'A+, A-, AB+, AB-',
        canReceiveFrom: 'A-, O-'
      },
      {
        bloodGroup: 'B+',
        description: 'Type B positive blood has B antigens on red blood cells and anti-A antibodies in plasma. The Rh factor is positive. This blood type is found in about 9% of the population.',
        canDonateTo: 'B+, AB+',
        canReceiveFrom: 'B+, B-, O+, O-'
      },
      {
        bloodGroup: 'B-',
        description: 'Type B negative blood has B antigens on red blood cells and anti-A antibodies in plasma. The Rh factor is negative. This is a relatively rare blood type, found in about 2% of the population.',
        canDonateTo: 'B+, B-, AB+, AB-',
        canReceiveFrom: 'B-, O-'
      },
      {
        bloodGroup: 'AB+',
        description: 'Type AB positive blood has both A and B antigens on red blood cells but no anti-A or anti-B antibodies in plasma. The Rh factor is positive. This is the universal plasma donor and can receive red blood cells from any blood type.',
        canDonateTo: 'AB+',
        canReceiveFrom: 'A+, A-, B+, B-, AB+, AB-, O+, O-'
      },
      {
        bloodGroup: 'AB-',
        description: 'Type AB negative blood has both A and B antigens on red blood cells but no anti-A or anti-B antibodies in plasma. The Rh factor is negative. This is a rare blood type, found in less than 1% of the population.',
        canDonateTo: 'AB+, AB-',
        canReceiveFrom: 'A-, B-, AB-, O-'
      },
      {
        bloodGroup: 'O+',
        description: 'Type O positive blood has no A or B antigens on red blood cells but has both anti-A and anti-B antibodies in plasma. The Rh factor is positive. This is the most common blood type, found in about 38% of the population.',
        canDonateTo: 'A+, B+, AB+, O+',
        canReceiveFrom: 'O+, O-'
      },
      {
        bloodGroup: 'O-',
        description: 'Type O negative blood has no A or B antigens on red blood cells but has both anti-A and anti-B antibodies in plasma. The Rh factor is negative. This is the universal red blood cell donor, compatible with all blood types in emergency situations.',
        canDonateTo: 'A+, A-, B+, B-, AB+, AB-, O+, O-',
        canReceiveFrom: 'O-'
      }
    ];

    for (const bloodGroupData of bloodGroups) {
      const existingBloodGroup = await this.bloodGroupRepository.findOne({
        where: { bloodGroup: bloodGroupData.bloodGroup }
      });

      if (!existingBloodGroup) {
        const bloodGroup = this.bloodGroupRepository.create(bloodGroupData);
        await this.bloodGroupRepository.save(bloodGroup);
        console.log(`Blood group ${bloodGroupData.bloodGroup} seeded successfully`);
      } else {
        console.log(`Blood group ${bloodGroupData.bloodGroup} already exists`);
      }
    }
    
    console.log('Blood group seeding completed!');
  }
}
