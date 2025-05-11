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
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { DonorService } from './donor.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto, UpdatePasswordDto } from './dto/update-donor.dto';
import { FilterDonorDto } from './dto/filter-donor.dto';
import { DonorStatus } from 'src/common/enums/donor-status.enum';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { Public } from 'src/auth/auth.guard';

@Controller('donors')
export class DonorController {
  private readonly logger = new Logger(DonorController.name);
  
  constructor(private readonly donorService: DonorService) {}

  @Post()
  @Public()
  async create(@Body() createDonorDto: CreateDonorDto) {
    const donor = await this.donorService.create(createDonorDto);
    return { message: 'Donor created successfully', donor };
  }

  @Get()
  @Public()
  async findAll(@Query() filterDto: FilterDonorDto) {
    return this.donorService.findAll(filterDto);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const donor = await this.donorService.findOne(id);
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }
    return donor;
  }

  @Get('email/:email')
  @Public()
  async findByEmail(@Param('email') email: string) {
    const donor = await this.donorService.findByEmail(email);
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }
    return donor;
  }

  @Patch(':id')
  @Public()
  async update(@Param('id') id: string, @Body() updateDonorDto: UpdateDonorDto) {
    this.logger.log(`PATCH request received for donor ID: ${id}`);
    this.logger.log(`Update data: ${JSON.stringify(updateDonorDto)}`);
    
    const updated = await this.donorService.update(id, updateDonorDto);
    if (!updated) {
      this.logger.error(`Donor not found with ID: ${id}`);
      throw new NotFoundException('Donor not found');
    }
    
    this.logger.log(`Donor updated successfully: ${JSON.stringify(updated)}`);
    return { message: 'Donor updated successfully', donor: updated };
  }

  @Post(':id/change-password')
  @Public()
  async updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
    const success = await this.donorService.updatePassword(id, updatePasswordDto);
    if (!success) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Donor not found',
      };
    }
    return { message: 'Password updated successfully' };
  }

  @Post('delete-account/:id')
  @Public()
  async deleteAccount(@Param('id') id: string, @Body() deleteAccountDto: DeleteAccountDto) {
    try {
      const success = await this.donorService.deleteAccount(id, deleteAccountDto);
      if (success) {
        return { message: 'Account deleted successfully' };
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Donor not found');
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Incorrect password');
      }
      throw error;
    }
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const success = await this.donorService.remove(id);
    if (!success) {
      throw new NotFoundException('Donor not found or already deleted');
    }
  }

  @Get('bloodgroup/shortage/:bloodGroup')
  @Public()
  async getBloodGroupInsufficientDonors(@Param('bloodGroup') bloodGroup: string) {
    return this.donorService.getBloodGroupInsufficientDonors(bloodGroup);
  }

  @Patch(':id/status')
  @Public()
  async updateStatus(@Param('id') id: string, @Body('status') status: DonorStatus) {
    const updated = await this.donorService.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundException('Donor not found');
    }
    return { message: 'Donor status updated successfully', updated };
  }
}