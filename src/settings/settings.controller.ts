import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Public } from 'src/auth/auth.guard';
//import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

@Public()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}
   
  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('donor/:donorId')
  findByDonorId(@Param('donorId') donorId: string) {
    return this.settingsService.findByDonorId(+donorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(+id, updateSettingDto);
  }

  @Patch('donor/:donorId')
  updateByDonorId(
    @Param('donorId') donorId: string,
    @Body() updateSettingDto: UpdateSettingDto
  ) {
    return this.settingsService.updateByDonorId(+donorId, updateSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(+id);
  }
}