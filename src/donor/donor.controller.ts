import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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
    return this.donorService.findOne(id);
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

  @Get('eligible')
  async getEligibleDonors(): Promise<Donor[]> {
    return this.donorService.getEligibleDonors();
  }
}
