// src/events/dto/register-event.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterEventDto {
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsNotEmpty()
  @IsString()
  donorId: string;
}
