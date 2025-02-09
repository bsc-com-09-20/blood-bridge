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
import { BloodInventoryService } from './blood-inventory.service';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';
import { UpdateBloodInventoryDto } from './dto/update-blood-inventory.dto';

@ApiTags('blood-inventory')
@Controller('blood-inventory')
export class BloodInventoryController {
  constructor(private readonly bloodInventoryService: BloodInventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blood inventory entry' })
  @ApiResponse({ status: 201, description: 'The blood inventory entry has been successfully created.' })
  create(@Body() createBloodInventoryDto: CreateBloodInventoryDto) {
    return this.bloodInventoryService.create(createBloodInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blood inventory entries' })
  findAll() {
    return this.bloodInventoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a blood inventory entry by id' })
  findOne(@Param('id') id: string) {
    return this.bloodInventoryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blood inventory entry' })
  update(
    @Param('id') id: string,
    @Body() updateBloodInventoryDto: UpdateBloodInventoryDto,
  ) {
    return this.bloodInventoryService.update(+id, updateBloodInventoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blood inventory entry' })
  remove(@Param('id') id: string) {
    return this.bloodInventoryService.remove(+id);
  }
}