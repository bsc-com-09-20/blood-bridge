/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: 'The title of the event' })
  title: string;

  @ApiProperty({ description: 'A brief description of the event' })
  description: string;

  @ApiProperty({ description: 'Date of the event (ISO format)' })
  date: Date;

  @ApiProperty({ description: 'Location where the event will take place' })
  location: string;
}
