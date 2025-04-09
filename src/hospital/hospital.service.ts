import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Point } from 'geojson';
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

    // Create hospital with location point if coordinates are provided
    const hospital = this.hospitalRepository.create({
      ...createHospitalDto,
      password: hashedPassword,
    });

    // Create GeoJSON Point for location if coordinates are provided
    if (createHospitalDto.latitude && createHospitalDto.longitude) {
      const point: Point = {
        type: 'Point',
        coordinates: [createHospitalDto.longitude, createHospitalDto.latitude], // GeoJSON uses [longitude, latitude] order
      };
      
      hospital.location = point;
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
    const stringId = id.toString(); // convert number to string if needed
  
    const hospital = await this.hospitalRepository.findOne({
      where: { id: stringId },
    });
  
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${stringId} not found`);
    }
  
    const { password, ...result } = hospital;
    return result as Hospital;
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {  // Changed from number to string
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
      const point: Point = {
        type: 'Point',
        coordinates: [updateHospitalDto.longitude, updateHospitalDto.latitude],
      };
      
      updateHospitalDto['location'] = point;
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

  async remove(id: string): Promise<void> {  // Changed from number to string
    const result = await this.hospitalRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
  }

  async findNearby(latitude: number, longitude: number, distance: number = 5000): Promise<Hospital[]> {
    // Find hospitals within the given distance (in meters)
    // Using PostGIS ST_DWithin function for geography type
    const hospitals = await this.hospitalRepository
      .createQueryBuilder('hospital')
      .where(
        `ST_DWithin(
          hospital.location, 
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), 
          :distance
        )`,
        { latitude, longitude, distance }
      )
      .orderBy(
        `ST_Distance(
          hospital.location, 
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
        )`,
        'ASC'
      )
      .getMany();

    // Remove password from results
    return hospitals.map(hospital => {
      const { password, ...result } = hospital;
      return result as Hospital;
    });
  }
}