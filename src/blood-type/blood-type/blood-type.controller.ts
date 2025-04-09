// blood-group.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
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
  findOne(@Param('id') id: string) {
    return this.bloodGroupService.findOne(id);
  }

  @Get('/by-group/:bloodGroup')
  findByGroup(@Param('bloodGroup') bloodGroup: string) {
    return this.bloodGroupService.findByGroup(bloodGroup);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBloodGroupDto) {
    return this.bloodGroupService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bloodGroupService.remove(id);
  }
}
