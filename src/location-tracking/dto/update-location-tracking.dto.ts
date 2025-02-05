import { PartialType } from '@nestjs/swagger';
import { CreateLocationTrackingDto } from './create-location-tracking.dto';

export class UpdateLocationTrackingDto extends PartialType(CreateLocationTrackingDto) {}
