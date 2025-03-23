import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocationTrackingService } from './location-tracking.service';
import { CreateLocationTrackingDto } from './dto/create-location-tracking.dto';
import { UpdateLocationTrackingDto } from './dto/update-location.dto';

@Controller('location-tracking')
export class LocationTrackingController {
  constructor(private readonly locationTrackingService: LocationTrackingService) {}

  @Post()
  create(@Body() createLocationTrackingDto: CreateLocationTrackingDto) {
    return this.locationTrackingService.create(createLocationTrackingDto);
  }

  @Get()
  findAll() {
    return this.locationTrackingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationTrackingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocationTrackingDto: UpdateLocationTrackingDto) {
    return this.locationTrackingService.update(+id, updateLocationTrackingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationTrackingService.remove(+id);
  }
}
