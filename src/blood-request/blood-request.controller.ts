import { Controller, Post, Body, UseGuards, Req, Get, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { BloodRequestService } from './blood-request.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { HospitalOnly } from '../auth/dto/roles/hospital-roles.decorator';
import { BloodType } from '../common/enums/blood-type.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from 'src/auth/auth.guard';

class CreateBloodRequestDto {
  bloodType: BloodType;
  quantity: number;
  radius:number;
}

@Controller('blood-requests')
@Public()
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

  @Get('hospital/:hospitalId')
  @ApiOperation({ summary: 'Get all blood requests for a hospital' })
  async getHospitalRequests(@Param('hospitalId') hospitalId: string) {
    // Changed parameter type from number to string
    return this.service.getRequestsByHospital(hospitalId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific blood request' })
  async getRequest(@Param('id') id: string) {
    // Changed parameter type from number to string
    return this.service.findOne(id);
  }
  
  
}