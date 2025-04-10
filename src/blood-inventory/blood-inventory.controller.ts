import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BloodInventoryService } from './blood-inventory.service';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';
import { UpdateBloodInventoryDto } from './dto/update-blood-inventory.dto';
import { Public } from '../auth/auth.guard';
import { BloodInventory } from './entities/blood-inventory.entity';

@ApiTags('blood-inventory')
@Controller('blood-inventory')
@Public()
export class BloodInventoryController {
  constructor(private readonly bloodInventoryService: BloodInventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blood inventory entry' })
  @ApiResponse({ 
    status: 201, 
    description: 'The blood inventory entry has been successfully created.',
    type: BloodInventory
  })
  create(@Body() createBloodInventoryDto: CreateBloodInventoryDto) {
    return this.bloodInventoryService.create(createBloodInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blood inventory entries' })
  @ApiResponse({
    status: 200,
    description: 'List of all blood inventory entries',
    type: [BloodInventory]
  })
  findAll() {
    return this.bloodInventoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a blood inventory entry by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The found blood inventory entry',
    type: BloodInventory
  })
  @ApiResponse({ status: 404, description: 'Blood inventory entry not found' })
  findOne(@Param('id') id: string) {
    return this.bloodInventoryService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blood inventory entry' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The updated blood inventory entry',
    type: BloodInventory
  })
  @ApiResponse({ status: 404, description: 'Blood inventory entry not found' })
  update(@Param('id') id: string, @Body() updateBloodInventoryDto: UpdateBloodInventoryDto) {
    return this.bloodInventoryService.update(Number(id), updateBloodInventoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blood inventory entry' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Blood inventory entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Blood inventory entry not found' })
  remove(@Param('id') id: string) {
    return this.bloodInventoryService.remove(Number(id));
  }
}