// blood-request.controller.ts (Updated)
import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Patch, 
  HttpCode, 
  HttpStatus, 
  NotFoundException 
} from '@nestjs/common';
import { BloodRequestService } from './blood-request.service';
import { BloodType } from '../common/enums/blood-type.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/auth/auth.guard';

class CreateBloodRequestDto {
  bloodType: BloodType;
  quantity: number;
  radius: number;
}

@Controller('blood-requests')
@ApiTags('blood-requests')
@Public()
export class BloodRequestController {
  constructor(private readonly service: BloodRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blood request' })
  async createRequest(@Body() body: {
    hospitalId: string;
    bloodType: BloodType | 'ALL';
    quantity: number;
    radius: number;
  }) {
    return this.service.createRequest(
      body.hospitalId,
      body.bloodType,
      body.quantity,
      body.radius
    );
  }

  @Get('hospital/:hospitalId')
  @ApiOperation({ summary: 'Get all blood requests for a hospital' })
  async getHospitalRequests(@Param('hospitalId') hospitalId: string) {
    return this.service.getRequestsByHospital(hospitalId);
  }

  @Get('donor/:donorId')
  @ApiOperation({ summary: 'Get all blood requests for a donor' })
  async getDonorRequests(@Param('donorId') donorId: string) {
    return this.service.getRequestsByDonor(donorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific blood request' })
  async getRequest(@Param('id') id: string) {
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
  @ApiOperation({ summary: 'Respond to a blood request' })
  async respondToRequest(
    @Param('id') id: string,
    @Body() body: { donorId: string }
  ) {
    return this.service.respondToRequest(id, body.donorId);
  }
}