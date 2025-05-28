import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Hospital } from './entities/hospital.entity';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@Injectable()
export class HospitalService {
  constructor(
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
  ) {}

  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    // Check if hospital with email already exists
    const existingHospital = await this.hospitalRepository.findOne({
      where: { email: createHospitalDto.email },
    });

    if (existingHospital) {
      throw new ConflictException('Hospital with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createHospitalDto.password, 10);

    // Create hospital
    const hospital = this.hospitalRepository.create({
      ...createHospitalDto,
      password: hashedPassword,
    });

    // Set location data if coordinates are provided
    if (createHospitalDto.latitude && createHospitalDto.longitude) {
      hospital.latitude = createHospitalDto.latitude;
      hospital.longitude = createHospitalDto.longitude;
      
      // Create MySQL POINT format: POINT(longitude latitude)
      hospital.location = `POINT(${createHospitalDto.longitude} ${createHospitalDto.latitude})`;
    }

    const savedHospital = await this.hospitalRepository.save(hospital);
    
    // Remove password from returned object
    const { password, ...result } = savedHospital;
    return result as Hospital;
  }

  async findAll(): Promise<Hospital[]> {
    const hospitals = await this.hospitalRepository.find();
    
    // Remove passwords from results
    return hospitals.map(hospital => {
      const { password, ...result } = hospital;
      return result as Hospital;
    });
  }

  async findOne(id: string | number): Promise<Hospital> {
    const stringId = id.toString();
  
    const hospital = await this.hospitalRepository.findOne({
      where: { id: stringId },
    });
  
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${stringId} not found`);
    }
  
    const { password, ...result } = hospital;
    return result as Hospital;
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {
    const hospital = await this.hospitalRepository.findOne({
      where: { id },
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    // If trying to update email, check if it's already taken
    if (updateHospitalDto.email && updateHospitalDto.email !== hospital.email) {
      const existingHospital = await this.hospitalRepository.findOne({
        where: { email: updateHospitalDto.email },
      });

      if (existingHospital) {
        throw new ConflictException('Hospital with this email already exists');
      }
    }

    // Hash password if provided
    if (updateHospitalDto.password) {
      updateHospitalDto.password = await bcrypt.hash(updateHospitalDto.password, 10);
    }

    // Update location if coordinates are provided
    if (updateHospitalDto.latitude && updateHospitalDto.longitude) {
      updateHospitalDto.latitude = updateHospitalDto.latitude;
      updateHospitalDto.longitude = updateHospitalDto.longitude;
      updateHospitalDto['location'] = `POINT(${updateHospitalDto.longitude} ${updateHospitalDto.latitude})`;
    }

    await this.hospitalRepository.update(id, updateHospitalDto);
    
    const updatedHospital = await this.hospitalRepository.findOne({
      where: { id },
    });

    if (!updatedHospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found after update`);
    }

    // Remove password from result
    const { password, ...result } = updatedHospital;
    return result as Hospital;
  }

  async remove(id: string): Promise<void> {
    const result = await this.hospitalRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
  }

  // Updated method using MySQL spatial functions
  async findNearby(latitude: number, longitude: number, distance: number = 5000): Promise<Hospital[]> {
    // Method 1: Using MySQL ST_Distance_Sphere (more accurate)
    const query = `
      SELECT *, 
             ST_Distance_Sphere(location, POINT(?, ?)) as distance_meters
      FROM hospital 
      WHERE location IS NOT NULL 
        AND ST_Distance_Sphere(location, POINT(?, ?)) <= ?
      ORDER BY distance_meters ASC
    `;

    const hospitals = await this.hospitalRepository.query(query, [
      longitude, latitude,  // First POINT parameters
      longitude, latitude,  // Second POINT parameters  
      distance              // Distance in meters
    ]);

    // Remove password from results and convert to Hospital objects
    return hospitals.map(hospital => {
      const { password, ...result } = hospital;
      return result as Hospital;
    });
  }

  // Alternative method using separate lat/lng columns (fallback)
  async findNearbyWithLatLng(latitude: number, longitude: number, radiusKm: number = 5): Promise<Hospital[]> {
    // Using Haversine formula for distance calculation
    const query = `
      SELECT *, 
             (6371 * acos(
               cos(radians(?)) * cos(radians(latitude)) * 
               cos(radians(longitude) - radians(?)) + 
               sin(radians(?)) * sin(radians(latitude))
             )) AS distance_km
      FROM hospital 
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
      HAVING distance_km <= ?
      ORDER BY distance_km ASC
    `;

    const hospitals = await this.hospitalRepository.query(query, [
      latitude, longitude, latitude, radiusKm
    ]);

    // Remove password from results
    return hospitals.map(hospital => {
      const { password, ...result } = hospital;
      return result as Hospital;
    });
  }

  // Method to get distance between two points
  async getDistanceToHospital(hospitalId: string, userLatitude: number, userLongitude: number): Promise<number> {
    const query = `
      SELECT ST_Distance_Sphere(location, POINT(?, ?)) as distance_meters
      FROM hospital 
      WHERE id = ? AND location IS NOT NULL
    `;

    const result = await this.hospitalRepository.query(query, [
      userLongitude, userLatitude, hospitalId
    ]);

    return result[0]?.distance_meters || null;
  }
}