import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { DonorService } from './donor.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { Donor } from './entities/donor.entity';

@Controller('donors')
export class DonorController {
  constructor(private readonly donorService: DonorService) {}

  @Post()
  async create(@Body() createDonorDto: CreateDonorDto): Promise<Donor> {
    return this.donorService.create(createDonorDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterDonorDto): Promise<Donor[]> {
    return this.donorService.findAll(filterDto);
  }

  @Get(':id')
async findOne(@Param('id') id: string): Promise<Donor> {
  const donor = await this.donorService.findOne(id);
  if (!donor) {
    throw new NotFoundException(`Donor with ID ${id} not found`);
  }
  return donor;
}

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<Donor | null> {
    return this.donorService.findByEmail(email);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDonorDto: UpdateDonorDto): Promise<Donor> {
    return this.donorService.update(id, updateDonorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.donorService.remove(id);
  }

  @Get('nearby')
  async findNearbyDonors(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 10,
    @Query('bloodGroup') bloodGroup?: string,
  ): Promise<Donor[]> {
    return this.donorService.findNearbyDonors(latitude, longitude, radius, bloodGroup);
  }

  @Get('blood-group-insufficiency')
  async getBloodGroupInsufficientDonors(@Query('bloodGroup') bloodGroup: string) {
    return this.donorService.getBloodGroupInsufficientDonors(bloodGroup);
  }
}
