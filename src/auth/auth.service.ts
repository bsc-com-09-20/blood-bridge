import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Point } from 'geojson';

import { LoginDto } from './dto/login.dto';
import { CreateDonorDto } from '../donor/dto/create-donor.dto';
import { Donor } from 'src/donor/entities/donor.entity';
import { Hospital } from 'src/hospital/entities/hospital.entity';
import { LoginResponseDto } from './dto/login-response.dto';

interface AuthPayload {
  id: string;
  email: string;
  role: 'donor' | 'hospital';
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(Donor)
    private donorRepo: Repository<Donor>,

    @InjectRepository(Hospital)
    private hospitalRepo: Repository<Hospital>,
  ) {}
  async login(loginDto: LoginDto) {
    const { email, password, latitude, longitude } = loginDto;
    
    // Try donor login
    const donor = await this.donorRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'location', 'name', 'bloodGroup', 'phone', 'lastDonation'],
    });
    
    if (donor?.password) {
      const isMatch = await bcrypt.compare(password, donor.password);
      
      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }
      
      // Update donor location on every login if coordinates are provided
      if (latitude && longitude) {
        // Create GeoJSON Point
        const point: Point = {
          type: 'Point',
          coordinates: [longitude, latitude] // GeoJSON uses [longitude, latitude] order
        };
        
        donor.location = point;
        await this.donorRepo.save(donor);
      }
      
      const payload: AuthPayload = {
        id: donor.id,
        email: donor.email,
        role: 'donor'
      };
      
      // Remove password from returned user object
      const { password: _, ...donorWithoutPassword } = donor;
      
      // In auth.service.ts login method
      return {
        token: this.jwtService.sign(payload),
        userId: donor.id.toString(),  // or hospital.id.toString()
        role: 'donor',  // or 'hospital'
        name: donor.name  // or hospital.name
      };
    }
    
    // Try hospital login
    const hospital = await this.hospitalRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'latitude', 'longitude', 'name'], // Update these fields based on your Hospital entity
    });
    
    if (hospital?.password) {
      const isMatch = await bcrypt.compare(password, hospital.password);
      
      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }
      
      // Update hospital location - adapt this based on your Hospital entity
      // If Hospital also uses GeoJSON, update similarly to donor above
      if ((!hospital.latitude || !hospital.longitude) && latitude && longitude) {
        hospital.latitude = latitude;
        hospital.longitude = longitude;
        await this.hospitalRepo.save(hospital);
      }
      
      const payload: AuthPayload = {
        id: hospital.id.toString(),
        email: hospital.email,
        role: 'hospital'
      };
      
      // Remove password from returned user object
      const { password: _, ...hospitalWithoutPassword } = hospital;
      
     // In auth.service.ts login method
      return {
        token: this.jwtService.sign(payload),
        userId: hospital.id.toString(),  // or hospital.id.toString()
        role: 'hospital',  // or 'hospital'
        name: hospital.name  // or hospital.name
      };
    }
    
    throw new UnauthorizedException('Invalid email or password');
  }
  
  async registerDonor(dto: CreateDonorDto): Promise<LoginResponseDto> {
    const existingDonor = await this.donorRepo.findOne({
      where: { email: dto.email },
    });
  
    if (existingDonor) {
      throw new UnauthorizedException('Email already registered');
    }
  
    const hashedPassword = await bcrypt.hash(dto.password, 10);
  
    let location: Point | undefined;
    if (dto.latitude && dto.longitude) {
      location = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }
  
    const newDonor = this.donorRepo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      bloodGroup: dto.bloodGroup,
      password: hashedPassword,
      location,
    });
  
    const savedDonor = await this.donorRepo.save(newDonor);
  
    // Create JWT payload
    const payload: AuthPayload = {
      id: savedDonor.id.toString(),
      email: savedDonor.email,
      role: 'donor',
    };
  
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedDonor.id.toString(),
        email: savedDonor.email,
        name: savedDonor.name,
        bloodGroup: savedDonor.bloodGroup,
        phone: savedDonor.phone,
        lastDonation: savedDonor.lastDonation,
        location: savedDonor.location,
      },
      role: 'donor',
    };
  }
  
}
