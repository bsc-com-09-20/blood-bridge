import { Controller, Post, Body, UseGuards, Req, Get, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { BloodRequestService } from './blood-request.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { HospitalOnly } from '../auth/dto/roles/hospital-roles.decorator';
import { BloodType } from '../common/enums/blood-type.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

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

  @Get('hospital/:hospitalId')
  @ApiOperation({ summary: 'Get all blood requests for a hospital' })
  async getHospitalRequests(@Param('hospitalId') hospitalId: number) {
    // Implement a method in your service to get requests by hospital
    return this.service.getRequestsByHospital(hospitalId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific blood request' })
  async getRequest(@Param('id') id: number) {
    // Implement a method in your service to get a single request
    return this.service.findOne(id);
  }
  
  
}