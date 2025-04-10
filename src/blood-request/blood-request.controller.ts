import { Controller, Post, Body, UseGuards, Req, Get, Param, Delete, Patch } from '@nestjs/common';
import { BloodRequestService } from './blood-request.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
 
import { BloodType } from '../common/enums/blood-type.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { HospitalOnly } from 'src/auth/dto/roles/hospital-roles.decorator';
import { Public } from 'src/auth/auth.guard'
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';

@Controller('blood-requests')
export class BloodRequestController {
  constructor(private readonly service: BloodRequestService) {}

@Post()
@Public()
async createRequest(
  @Body() body: CreateBloodRequestDto
) {
  return this.service.requestDonorsByDistance(
    parseInt(body.hospitalId, 10), // Use the ID from the request body instead of req.user.sub
    body.bloodType,
    body.radius,
    body.broadcastAll || false,
    body.quantity
  );
}
 

  @Get('hospital/:hospitalId')
  @ApiOperation({ summary: 'Get all blood requests for a hospital' })
  async getHospitalRequests(@Param('hospitalId') hospitalId: number) {
    return this.service.getRequestsByHospital(hospitalId);
  }

  @Get('stats/:hospitalId')
  @ApiOperation({ summary: 'Get blood request statistics for a hospital' })
  async getRequestStatistics(@Param('hospitalId') hospitalId: number) {
    return this.service.getRequestStatistics(hospitalId);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HospitalOnly()
  @ApiOperation({ summary: 'Cancel a blood request' })
  async cancelRequest(@Param('id') id: string) {
    return this.service.cancelRequest(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific blood request' })
  async getRequest(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}