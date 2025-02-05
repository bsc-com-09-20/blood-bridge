import { Test, TestingModule } from '@nestjs/testing';
import { BloodRequestService } from './blood-request.service';

describe('BloodRequestService', () => {
  let service: BloodRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BloodRequestService],
    }).compile();

    service = module.get<BloodRequestService>(BloodRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
