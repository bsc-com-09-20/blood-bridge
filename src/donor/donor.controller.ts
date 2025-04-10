import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, NotFoundException, UseGuards } from '@nestjs/common';
import { DonorService } from './donor.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { Donor } from './entities/donor.entity';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard, Public } from 'src/auth/auth.guard';
import { Role } from 'src/auth/role.enum';
import { BloodType } from 'src/common/enums/blood-type.enum';

@Controller('donors')
@Public()
export class DonorController {
  constructor(private readonly donorService: DonorService) {}

  // Create new Donor with hashed password
  @Post()
  async create(@Body() createDonorDto: CreateDonorDto): Promise<Donor> {
    // Optionally, you can add additional validation here if needed
    if (!createDonorDto.password || createDonorDto.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    return this.donorService.create(createDonorDto);
  }

  // Get all donors with filter parameters
  @Get()
  async findAll(@Query() filterDto: FilterDonorDto): Promise<Donor[]> {
    return this.donorService.findAll(filterDto);
  }

  // Get donor by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Donor> {
    const donor = await this.donorService.findOne(id);
    if (!donor) {
      throw new NotFoundException(`Donor with ID ${id} not found`);
    }
    return donor;
  }

  // Get donor by email
  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<Donor | null> {
    const donor = await this.donorService.findByEmail(email);
    if (!donor) {
      throw new NotFoundException(`Donor with email ${email} not found`);
    }
    return donor;
  }

  // Update donor's details, including password (hashed)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDonorDto: UpdateDonorDto): Promise<Donor> {
    return this.donorService.update(id, updateDonorDto);
  }

  // Remove donor by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.donorService.remove(id);
  }

  // Find nearby donors based on location
  @Get('nearby')
  async findNearbyDonors(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 10,
    @Query('bloodGroup') bloodGroup?: string,
  ): Promise<Donor[]> {
    const bloodType = bloodGroup || '';
    return this.donorService.findNearbyDonors(latitude, longitude, radius, bloodType);
  }

  // Check for insufficient donors of a specific blood group
  @Get('blood-group-insufficiency')
  async getBloodGroupInsufficientDonors(@Query('bloodGroup') bloodGroup: string) {
    return this.donorService.getBloodGroupInsufficientDonors(bloodGroup);
  }
}
