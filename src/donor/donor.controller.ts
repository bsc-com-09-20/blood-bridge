import { Controller, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Post('register')
  @UseGuards(FirebaseAuthGuard) // Protect this route
  async register(@Body() createDonorDto: CreateDonorDto) {
    return this.donorsService.createDonor(createDonorDto);
  }

  @Patch(':id/location')
  @UseGuards(FirebaseAuthGuard) // Protect this route
  async updateLocation(
    @Param('id') donorId: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.donorsService.updateLocation(donorId, updateLocationDto);
  }
}