import { Test, TestingModule } from '@nestjs/testing';
import { DeliverLogicService } from './deliver-logic.service';

describe('DeliverLogicService', () => {
  let service: DeliverLogicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliverLogicService],
    }).compile();

    service = module.get<DeliverLogicService>(DeliverLogicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
