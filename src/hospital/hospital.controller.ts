import { Controller, Get, UseGuards,Req } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { HospitalOnly } from '../auth/dto/roles/hospital-roles.decorator';

@Controller('hospitals')
export class HospitalController {
  constructor(private readonly service: HospitalService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HospitalOnly()
  getCurrentHospital(@Req() req) {
    return this.service.findOne(req.user.sub);
  }
}