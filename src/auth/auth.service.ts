import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

    // Attempt Donor login
    const donor = await this.donorRepo.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'latitude',
        'longitude',
        'name',
        'bloodGroup',
        'phone',
        'lastDonation',
      ],
    });

    if (donor?.password) {
      const isMatch = await bcrypt.compare(password, donor.password);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (latitude && longitude) {
        donor.latitude = latitude;
        donor.longitude = longitude;
        donor.lastActive = new Date();
        await this.donorRepo.save(donor);
      }

      const payload: AuthPayload = {
        id: String(donor.id),
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

    // Attempt Hospital login
    const hospital = await this.hospitalRepo.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'latitude',
        'longitude',
        'name',
      ],
    });

    if (hospital?.password) {
      const isMatch = await bcrypt.compare(password, hospital.password);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (latitude && longitude) {
        hospital.latitude = latitude;
        hospital.longitude = longitude;
        hospital.lastActive = new Date();
        await this.hospitalRepo.save(hospital);
      }

      const payload: AuthPayload = {
        id: hospital.id,
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

    const hashedPassword = await bcrypt.hash(dto.password, 10);

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
        latitude: savedDonor.latitude,
        longitude: savedDonor.longitude,
      },
      role: 'donor',
    };
  }
}
