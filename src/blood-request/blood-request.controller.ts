import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BloodRequestService } from './blood-request.service';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';
import { UpdateBloodRequestDto } from './dto/update-blood-request.dto';

@Controller('blood-request')
export class BloodRequestController {
  constructor(private readonly bloodRequestService: BloodRequestService) {}

  @Post()
  create(@Body() createBloodRequestDto: CreateBloodRequestDto) {
    return this.bloodRequestService.create(createBloodRequestDto);
  }

  @Get()
  findAll() {
    return this.bloodRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bloodRequestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBloodRequestDto: UpdateBloodRequestDto) {
    return this.bloodRequestService.update(+id, updateBloodRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bloodRequestService.remove(+id);
  }
}
