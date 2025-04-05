import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/login.dto';
import { Donor } from 'src/donor/entities/donor.entity';
import { Hospital } from 'src/hospital/entities/hospital.entity';

interface AuthUser {
  id: string;
  email: string;
  password: string;
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
    const { email, password } = loginDto;

    let user: AuthUser | null = null;
    let role: 'donor' | 'hospital' | null = null;

    const donor = await this.donorRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });

    if (donor?.password) {
      user = {
        id: donor.id,
        email: donor.email,
        password: donor.password,
      };
      role = 'donor';
    } else {
      const hospital = await this.hospitalRepo.findOne({
        where: { email },
        select: ['id', 'email', 'password'],
      });

      if (hospital?.password) {
        user = {
          id: hospital.id,
          email: hospital.email,
          password: hospital.password,
        };
        role = 'hospital';
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role };

    return {
      access_token: this.jwtService.sign(payload),
      role,
    };
  }
}
