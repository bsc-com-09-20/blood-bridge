import { Injectable } from '@nestjs/common';
import { CreateLocationTrackingDto } from './dto/create-location-tracking.dto';
import { UpdateLocationTrackingDto } from './dto/update-location-tracking.dto';

@Injectable()
export class LocationTrackingService {
  create(createLocationTrackingDto: CreateLocationTrackingDto) {
    return 'This action adds a new locationTracking';
  }

  findAll() {
    return `This action returns all locationTracking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} locationTracking`;
  }

  update(id: number, updateLocationTrackingDto: UpdateLocationTrackingDto) {
    return `This action updates a #${id} locationTracking`;
  }

  remove(id: number) {
    return `This action removes a #${id} locationTracking`;
  }
}
