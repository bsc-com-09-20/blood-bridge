// update-blood-type.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateBloodGroupDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
