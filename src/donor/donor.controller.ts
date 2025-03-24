import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DonorService } from './donor.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateLocationDto } from '../location-tracking/dto/update-location.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { Donor } from './entities/donor.entity';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorService) {}

  @Post('register')
  @UseGuards(FirebaseAuthGuard) // Protect this route
  async register(@Body() createDonorDto: CreateDonorDto) {
    return this.donorsService.createDonor(createDonorDto);
  }

  @Patch(':id/location')
  @UseGuards(FirebaseAuthGuard) // Protect this route
  async updateLocation(@Param('id') donorId: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.donorsService.updateLocation(donorId, updateLocationDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterDonorDto): Promise<Donor[]> {
    return this.donorsService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Donor> {
    return this.donorsService.findOne(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<Donor | null> {
    return this.donorsService.findByEmail(email);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDonorDto: UpdateDonorDto): Promise<Donor> {
    return this.donorsService.update(id, updateDonorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.donorsService.remove(id);
  }

  @Get('eligible')
  async getEligibleDonors(): Promise<Donor[]> {
    return this.donorsService.getEligibleDonors();
  }
}
