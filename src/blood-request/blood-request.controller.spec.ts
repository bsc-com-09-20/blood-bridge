import { Test, TestingModule } from '@nestjs/testing';
import { BloodRequestController } from './blood-request.controller';
import { BloodRequestService } from './blood-request.service';

describe('BloodRequestController', () => {
  let controller: BloodRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BloodRequestController],
      providers: [BloodRequestService],
    }).compile();

    controller = module.get<BloodRequestController>(BloodRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
