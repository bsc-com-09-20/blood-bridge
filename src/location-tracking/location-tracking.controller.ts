import { Controller, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { LocationTrackingService } from './location-tracking.service';
import { CreateLocationTrackingDto } from './dto/create-location-tracking.dto';
import { UpdateLocationTrackingDto } from './dto/update-location-tracking.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('location-tracking')
export class LocationTrackingController {
  constructor(private readonly locationService: LocationTrackingService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async create(@Body() data: CreateLocationTrackingDto) {
    return this.locationService.createLocation(data);
  }

  @Patch(':donorId')
  @UseGuards(FirebaseAuthGuard)
  async update(
    @Param('donorId') donorId: string,
    @Body() data: UpdateLocationTrackingDto,
  ) {
    return this.locationService.updateLocation(donorId, data);
  }
}