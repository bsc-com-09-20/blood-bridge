// create-blood-type.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBloodGroupDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
