import { Test, TestingModule } from '@nestjs/testing';
import { DonationSchedulingService } from './donation-scheduling.service';

describe('DonationSchedulingService', () => {
  let service: DonationSchedulingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DonationSchedulingService],
    }).compile();

    service = module.get<DonationSchedulingService>(DonationSchedulingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
