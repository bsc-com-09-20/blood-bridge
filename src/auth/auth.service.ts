import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { LoginDto } from './dto/login.dto';
import { CreateDonorDto } from '../donor/dto/create-donor.dto';
import { Donor } from 'src/donor/entities/donor.entity';
import { Hospital } from 'src/hospital/entities/hospital.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

interface AuthPayload {
  id: string;
  email: string;
  role: 'donor' | 'hospital';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,

    @InjectRepository(Donor)
    private donorRepo: Repository<Donor>,

    @InjectRepository(Hospital)
    private hospitalRepo: Repository<Hospital>,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, latitude, longitude } = loginDto;

    // Attempt Donor login - adding more detailed logging
    this.logger.log(`Attempting login for email: ${email}`);
    
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
      this.logger.log(`Donor found, validating password...`);
      const isMatch = await bcrypt.compare(password, donor.password);

      if (!isMatch) {
        this.logger.warn(`Invalid password attempt for donor: ${email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      if (latitude && longitude) {
        donor.latitude = latitude;
        donor.longitude = longitude;
        donor.lastActive = new Date();
        await this.donorRepo.save(donor);
      }

      const payload: AuthPayload = {
        id: donor.id.toString(),
        email: donor.email,
        role: 'donor',
      };

      const { password: _, ...donorWithoutPassword } = donor;
      const token = this.jwtService.sign(payload);
      
      this.logger.log(`Donor login successful: ${email}`);
      
      return {
        token,
        userId: donor.id.toString(),
        role: 'donor',
        name: donor.name,
      };
    }

    // Attempt Hospital login
    this.logger.log(`No donor found, attempting hospital login: ${email}`);
    
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
      this.logger.log(`Hospital found, validating password...`);
      const isMatch = await bcrypt.compare(password, hospital.password);

      if (!isMatch) {
        this.logger.warn(`Invalid password attempt for hospital: ${email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      if (latitude && longitude) {
        hospital.latitude = latitude;
        hospital.longitude = longitude;
        hospital.lastActive = new Date();
        await this.hospitalRepo.save(hospital);
      }

      const payload: AuthPayload = {
        id: hospital.id.toString(),
        email: hospital.email,
        role: 'hospital',
      };

      const { password: _, ...hospitalWithoutPassword } = hospital;
      const token = this.jwtService.sign(payload);
      
      this.logger.log(`Hospital login successful: ${email}`);
      
      return {
        token,
        userId: hospital.id.toString(),
        role: 'hospital',
        name: hospital.name,
      };
    }

    this.logger.warn(`No user found with email: ${email}`);
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

    // Send welcome email to new donor
    try {
      await this.mailService.sendWelcomeEmail(savedDonor.email, savedDonor.name);
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
      // Continue with registration even if email fails
    }

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

  /**
   * Generate a secure random token for password reset
   */
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      this.logger.log(`Processing forgot password request for: ${email}`);
      
      const donor = await this.donorRepo.findOne({
        where: { email },
      });
    
      // We'll still continue even if no donor is found
      // This prevents email enumeration attacks
      if (!donor) {
        this.logger.log(`No account found with email: ${email}`);
        return;
      }
    
      // Generate a more secure reset token
      const resetToken = this.generateResetToken();
      
      // Store the reset token and expiration
      donor.resetToken = resetToken;
      donor.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
      
      await this.donorRepo.save(donor);
      
      this.logger.log(`Generated reset token for ${email}`);
      
      // Use the mail service to send the password reset email with deep link
      await this.mailService.sendPasswordResetEmail(donor.email, resetToken, donor.name);
      
      this.logger.log(`Password reset email with deep link sent to ${email}`);
    } catch (error) {
      this.logger.error(`Error sending password reset email: ${error.message}`, error.stack);
      throw new Error('Failed to send password reset email');
    }
  }
  
  async resetPassword(token: string, newPassword: string): Promise<void> {
    this.logger.log(`Processing password reset with token`);
    
    const donor = await this.donorRepo.findOne({
      where: { resetToken: token },
    });

    if (!donor || !donor.resetTokenExpires || donor.resetTokenExpires < new Date()) {
      this.logger.warn(`Invalid or expired reset token used`);
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash the new password with an appropriate salt round
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password and clear the reset token
    donor.password = hashedPassword;
    donor.resetToken = null;
    donor.resetTokenExpires = null;
    
    await this.donorRepo.save(donor);
    
    this.logger.log(`Password reset successful for donor: ${donor.email}`);
    return;
  }

  async validateResetToken(token: string): Promise<Donor> {
    this.logger.log(`Validating reset token`);
    
    const donor = await this.donorRepo.findOne({
      where: { resetToken: token },
    });
  
    if (!donor || !donor.resetTokenExpires || donor.resetTokenExpires < new Date()) {
      this.logger.warn(`Invalid or expired reset token validation attempt`);
      throw new BadRequestException('Invalid or expired reset token');
    }
  
    this.logger.log(`Reset token validated successfully for: ${donor.email}`);
    return donor;
  }
}