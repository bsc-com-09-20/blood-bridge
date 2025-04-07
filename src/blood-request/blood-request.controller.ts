import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { BloodRequestService } from './blood-request.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { HospitalOnly } from '../auth/dto/roles/hospital-roles.decorator';
import { BloodType } from '../common/enums/blood-type.enum';

class CreateBloodRequestDto {
  bloodType: BloodType;
  quantity: number;
  radius:number;
}

@Controller('blood-requests')
export class BloodRequestController {
  constructor(private readonly service: BloodRequestService) {}

  @Post()
  async createRequest(
    @Body() body: CreateBloodRequestDto,
    @Req() req
  ) {
    return this.service.createRequest(
      req.user.sub,
      body.bloodType,
      body.quantity,
      body.radius
    );
  }
}