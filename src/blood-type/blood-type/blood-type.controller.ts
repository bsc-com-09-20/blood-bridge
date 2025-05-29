// 2. Fix blood-type.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { Public } from 'src/auth/auth.guard';
import { BloodGroupService } from './blood-type.service';
import { UpdateBloodGroupDto } from './dto/update-blood-group.dto';
import { CreateBloodGroupDto } from './dto/create-blood_group.dto';

@Controller('blood-groups')
@Public()
export class BloodGroupController {
  constructor(private readonly bloodGroupService: BloodGroupService) {}

  @Post()
  create(@Body() dto: CreateBloodGroupDto) {
    return this.bloodGroupService.create(dto);
  }

  @Get()
  findAll() {
    return this.bloodGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { // Use ParseIntPipe to convert string to number
    return this.bloodGroupService.findOne(id);
  }

  @Get('/by-group/:bloodGroup')
  findByGroup(@Param('bloodGroup') bloodGroup: string) {
    return this.bloodGroupService.findByGroup(bloodGroup);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBloodGroupDto) {
    return this.bloodGroupService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bloodGroupService.remove(id);
  }
}