import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  BadRequestException, 
  NotFoundException, 
  UseGuards,
  ParseIntPipe 
} from '@nestjs/common';
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
import { DonorStatus } from 'src/common/enums/donor-status.enum';

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

  // Find nearby donors based on location - MUST come before :id route
  @Get('nearby')
  async findNearbyDonors(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius: string = '10',
    @Query('bloodGroup') bloodGroup?: string,
  ): Promise<Donor[]> {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      throw new BadRequestException('Invalid latitude, longitude, or radius');
    }

    const bloodType = bloodGroup || 'ALL';
    return this.donorService.findNearbyDonors(lat, lng, rad, bloodType);
  }

  // Check for insufficient donors of a specific blood group
  @Get('blood-group-insufficiency')
  async getBloodGroupInsufficientDonors(@Query('bloodGroup') bloodGroup: string) {
    if (!bloodGroup) {
      throw new BadRequestException('Blood group parameter is required');
    }
    return this.donorService.getBloodGroupInsufficientDonors(bloodGroup);
  }

  // Get donor by email
  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<Donor> {
    const donor = await this.donorService.findByEmail(email);
    if (!donor) {
      throw new NotFoundException(`Donor with email ${email} not found`);
    }
    return donor;
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

  // Update donor's details, including password (hashed)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDonorDto: UpdateDonorDto): Promise<Donor> {
    return this.donorService.update(id, updateDonorDto);
  }

  // Update donor status
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: DonorStatus
  ): Promise<Donor> {
    if (!Object.values(DonorStatus).includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    return this.donorService.updateStatus(id, status);
  }

  // Remove donor by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.donorService.remove(id);
    return { message: `Donor with ID ${id} has been successfully deleted` };
  }
}