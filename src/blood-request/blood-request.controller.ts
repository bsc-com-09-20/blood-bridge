import { Controller, Post, Body, UseGuards, Req, Get, Param, Delete, HttpCode, HttpStatus, Patch, NotFoundException } from '@nestjs/common';
import { BloodRequestService } from './blood-request.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { HospitalOnly } from '../auth/dto/roles/hospital-roles.decorator';
import { BloodType } from '../common/enums/blood-type.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

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
async createRequest(@Body() body: {
  hospitalId: string;
  bloodType: BloodType;
  quantity: number;
  radius: number;
}) {
  return this.service.createRequest(
    body.hospitalId, // Get hospitalId directly from request body
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

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a blood request' })
  @ApiResponse({ status: 200, description: 'Request cancelled successfully' })
  async cancelRequest(@Param('id') id: string) {
    return this.service.cancelRequest(id);
  }

  @Post(':id/respond')
  @HttpCode(HttpStatus.OK)
async respondToRequest(
  @Param('id') id: string, 
  @Body() body: { donorId: string }
) {
  const donorId = body.donorId;
  const request = await this.service.findOne(id);
  
  // Safer check for donor existence
  if (!request || (request.donor && request.donor.id !== donorId)) {
    throw new NotFoundException('Blood request not found or not assigned to you');
  }
  
  // Only pass the ID since that's what the service method expects
  return this.service.respondToRequest(id);
}

  @Get('donor/:donorId')
  @ApiOperation({ summary: 'Get all blood requests for a donor' })
  async getDonorRequests(@Param('donorId') donorId: string) {
  return this.service.getRequestsByDonor(donorId);
}
  
  
}