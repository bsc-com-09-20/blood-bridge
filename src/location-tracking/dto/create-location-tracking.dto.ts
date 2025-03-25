import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateLocationTrackingDto {
  @IsString()
  @IsNotEmpty()
  donorId: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}