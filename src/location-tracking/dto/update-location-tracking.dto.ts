import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateLocationTrackingDto {
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}