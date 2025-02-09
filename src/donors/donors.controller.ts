import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DonorsService } from './donors.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';

@ApiTags('donors')
@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new donor' })
  @ApiResponse({ status: 201, description: 'The donor has been successfully created.' })
  create(@Body() createDonorDto: CreateDonorDto) {
    return this.donorsService.create(createDonorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all donors' })
  findAll() {
    return this.donorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a donor by id' })
  findOne(@Param('id') id: string) {
    return this.donorsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a donor' })
  update(@Param('id') id: string, @Body() updateDonorDto: UpdateDonorDto) {
    return this.donorsService.update(+id, updateDonorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a donor' })
  remove(@Param('id') id: string) {
    return this.donorsService.remove(+id);
  }
}