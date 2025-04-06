import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hospital } from './entities/hospital.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HospitalService {
  constructor(
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
  ) {}

  async validateAndUpdate(
    email: string,
    password: string,
    lat?: number,
    lng?: number
  ) {
    const hospital = await this.hospitalRepository.findOne({ where: { email } });
    
    if (!hospital || !(await bcrypt.compare(password, hospital.password))) {
      return null;
    }

    // Create update object
    const updates: Partial<Hospital> = { 
      last_login: new Date() 
    };
    
    if (lat && lng) {
      updates.latitude = lat;
      updates.longitude = lng;
      
      // For raw SQL updates, use the query builder
      await this.hospitalRepository
        .createQueryBuilder()
        .update(Hospital)
        .set({
          latitude: lat,
          longitude: lng,
          location: () => `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`,
          last_login: new Date()
        })
        .where("id = :id", { id: hospital.id })
        .execute();

      return this.hospitalRepository.findOne({ where: { id: hospital.id } });
    }

    // If no location update needed
    await this.hospitalRepository.update(hospital.id, updates);
    return this.hospitalRepository.findOne({ where: { id: hospital.id } });
  }

  async findOne(id: number) {
    return this.hospitalRepository.findOne({ where: { id } });
  }

  async createHospital(data: {
    name: string;
    email: string;
    password: string;
    latitude?: number;
    longitude?: number;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // For initial creation with location
    if (data.latitude && data.longitude) {
      return this.hospitalRepository
        .createQueryBuilder()
        .insert()
        .into(Hospital)
        .values({
          ...data,
          password: hashedPassword,
          location: () => `ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326)::geography`
        })
        .execute();
    }

    // Without location
    return this.hospitalRepository.save({
      ...data,
      password: hashedPassword,
    });
  }
}