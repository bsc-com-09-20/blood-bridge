import { Test, TestingModule } from '@nestjs/testing';
import { LocationTrackingController } from './location-tracking.controller';
import { LocationTrackingService } from './location-tracking.service';

describe('LocationTrackingController', () => {
  let controller: LocationTrackingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationTrackingController],
      providers: [LocationTrackingService],
    }).compile();

    controller = module.get<LocationTrackingController>(LocationTrackingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
