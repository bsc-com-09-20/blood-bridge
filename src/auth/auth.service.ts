import {
  Injectable,
  UnauthorizedException, BadRequestException,
} from '@nestjs/common';
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
  // In-memory token blacklist (for production, consider using Redis)
  private tokenBlacklist: Set<string> = new Set();

  constructor(
    private jwtService: JwtService,

    @InjectRepository(Donor)
    private donorRepo: Repository<Donor>,

    @InjectRepository(Hospital)
    private hospitalRepo: Repository<Hospital>,
    
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, latitude, longitude } = loginDto;

    // Validate GPS for donors
    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestException('GPS coordinates are required to login.');
    }

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

      // Always update donor location
      const point: Point = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
      donor.location = point;
      await this.donorRepo.save(donor);

      const payload: AuthPayload = {
        id: donor.id,
        email: donor.email,
        role: 'donor',
      };

      const { password: _, ...donorWithoutPassword } = donor;

      return {
        token: this.jwtService.sign(payload),
        userId: donor.id.toString(),
        role: 'donor',
        name: donor.name,
      };
    }

    // Try hospital login
    const hospital = await this.hospitalRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'latitude', 'longitude', 'name'],
    });

    if (hospital?.password) {
      const isMatch = await bcrypt.compare(password, hospital.password);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Set location only on first login
      if ((!hospital.latitude || !hospital.longitude) && latitude && longitude) {
        hospital.latitude = latitude;
        hospital.longitude = longitude;
        await this.hospitalRepo.save(hospital);
      }

      const payload: AuthPayload = {
        id: hospital.id.toString(),
        email: hospital.email,
        role: 'hospital',
      };

      const { password: _, ...hospitalWithoutPassword } = hospital;

      return {
        token: this.jwtService.sign(payload),
        userId: hospital.id.toString(),
        role: 'hospital',
        name: hospital.name,
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

    // Validate GPS is provided
    if (dto.latitude === undefined || dto.longitude === undefined) {
      throw new BadRequestException('GPS coordinates are required for registration.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const location: Point = {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    };

    const newDonor = this.donorRepo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      bloodGroup: dto.bloodGroup,
      password: hashedPassword,
      latitude: dto.latitude,
      longitude: dto.longitude,
      donations: dto.donations || 0, 
    });

    const savedDonor = await this.donorRepo.save(newDonor);

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