import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDonorDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string = '';

  @ApiProperty({ example: 'A+' })
  @IsString()
  @IsNotEmpty()
  bloodGroup: string= '';

  @ApiProperty({ example: '05 Jan 2025' })
  @IsString()
  @IsNotEmpty()
  lastDonation: string = '';
}