import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { DonorService } from './donor.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto, UpdatePasswordDto } from './dto/update-donor.dto';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { DonorStatus } from 'src/common/enums/donor-status.enum';

@Controller('donors')
export class DonorController {
  constructor(private readonly donorService: DonorService) {}

  @Post()
  async create(@Body() createDonorDto: CreateDonorDto) {
    const donor = await this.donorService.create(createDonorDto);
    return { message: 'Donor created successfully', donor };
  }

  @Get()
  async findAll(@Query() filterDto: FilterDonorDto) {
    return this.donorService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const donor = await this.donorService.findOne(id);
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }
    return donor;
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const donor = await this.donorService.findByEmail(email);
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }
    return donor;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDonorDto: UpdateDonorDto) {
    const updated = await this.donorService.update(id, updateDonorDto);
    if (!updated) {
      throw new NotFoundException('Donor not found');
    }
    return { message: 'Donor updated successfully', updated };
  }

  @Patch('update-password/:id')
  async updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
    const success = await this.donorService.updatePassword(id, updatePasswordDto);
    if (!success) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Current password is incorrect or donor not found',
      };
    }
    return { message: 'Password updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const success = await this.donorService.remove(id);
    if (!success) {
      throw new NotFoundException('Donor not found or already deleted');
    }
  }

  @Get('bloodgroup/shortage/:bloodGroup')
  async getBloodGroupInsufficientDonors(@Param('bloodGroup') bloodGroup: string) {
    return this.donorService.getBloodGroupInsufficientDonors(bloodGroup);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: DonorStatus) {
    const updated = await this.donorService.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundException('Donor not found');
    }
    return { message: 'Donor status updated successfully', updated };
  }
}
