import { IsDate, IsOptional, IsString, IsNumber, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDate()
  @Type(() => Date)
  eventDate: Date;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  locationAddress?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  totalSpots?: number;

  @IsOptional()
  @IsNumber()
  registeredCount?: number;

  @IsOptional()
  @IsNumber()
  availableSpots?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isWeekend?: boolean;

  @IsOptional()
  @IsBoolean()
  isThisWeek?: boolean;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  distance?: number;

  @IsOptional()
  @IsString()
  distanceUnit?: string;

  @IsOptional()
  @IsString()
  organizer?: string;

  @IsOptional()
  @IsString()
  organizerContact?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'ongoing', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  registrationDeadline?: Date;
}
