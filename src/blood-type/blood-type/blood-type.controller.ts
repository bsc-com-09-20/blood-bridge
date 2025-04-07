// blood-type.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BloodTypeService } from './blood-type.service';
import { CreateBloodTypeDto } from './dto/create-blood-type.dto';
import { UpdateBloodTypeDto } from './dto/update-blood-type.dto';
import { Public } from 'src/auth/auth.guard';

@Controller('blood-types')
@Public()
export class BloodTypeController {
  constructor(private readonly bloodTypeService: BloodTypeService) {}

  @Post()
  create(@Body() dto: CreateBloodTypeDto) {
    return this.bloodTypeService.create(dto);
  }

  @Get()
  findAll() {
    return this.bloodTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bloodTypeService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBloodTypeDto) {
    return this.bloodTypeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bloodTypeService.remove(id);
  }
}
