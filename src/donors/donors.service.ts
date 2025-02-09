import { Injectable } from '@nestjs/common';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { Donor } from './entities/donor.entity';

@Injectable()
export class DonorsService {
  private donors: Donor[] = [
    {
      id: 1,
      name: "John Doe",
      bloodGroup: "A+",
      lastDonation: "05 Jan 2025"
    },
    {
      id: 2,
      name: "Jane Smith",
      bloodGroup: "O-",
      lastDonation: "12 Dec 2024"
    }
  ];

  create(createDonorDto: CreateDonorDto) {
    const newDonor = {
      id: this.donors.length + 1,
      ...createDonorDto,
    };
    this.donors.push(newDonor);
    return newDonor;
  }

  findAll() {
    return this.donors;
  }

  findOne(id: number) {
    return this.donors.find(donor => donor.id === id);
  }

  update(id: number, updateDonorDto: UpdateDonorDto) {
    const index = this.donors.findIndex(donor => donor.id === id);
    if (index !== -1) {
      this.donors[index] = {
        ...this.donors[index],
        ...updateDonorDto,
      };
      return this.donors[index];
    }
    return null;
  }

  remove(id: number) {
    const index = this.donors.findIndex(donor => donor.id === id);
    if (index !== -1) {
      const donor = this.donors[index];
      this.donors.splice(index, 1);
      return donor;
    }
    return null;
  }
}