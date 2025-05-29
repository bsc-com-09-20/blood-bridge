import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseUUIDPipe,
  Query,
  ParseFloatPipe,
  ParseIntPipe
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { Public } from 'src/auth/auth.guard';

@Controller('hospital')
@Public()
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post()
  create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalService.create(createHospitalDto);
  }

  @Get()
  findAll() {
    return this.hospitalService.findAll();
  }

  @Get('nearby')
  findNearby(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('distance', new ParseIntPipe({ optional: true })) distance?: number,
  ) {
    return this.hospitalService.findNearby(latitude, longitude, distance);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hospitalService.findOne(id);
  }

  @Get(':id/distance')
  getDistance(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
  ) {
    return this.hospitalService.getDistanceToHospital(id, latitude, longitude);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ) {
    return this.hospitalService.update(id, updateHospitalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hospitalService.remove(id);
  }
}