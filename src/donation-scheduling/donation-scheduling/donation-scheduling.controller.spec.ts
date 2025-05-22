import { Test, TestingModule } from '@nestjs/testing';
import { DonationSchedulingController } from './donation-scheduling.controller';

describe('DonationSchedulingController', () => {
  let controller: DonationSchedulingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonationSchedulingController],
    }).compile();

    controller = module.get<DonationSchedulingController>(DonationSchedulingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
