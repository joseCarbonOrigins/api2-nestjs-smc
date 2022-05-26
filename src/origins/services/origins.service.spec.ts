import { Test, TestingModule } from '@nestjs/testing';
import { OriginsService } from './origins.service';

describe('OriginsService', () => {
  let service: OriginsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OriginsService],
    }).compile();

    service = module.get<OriginsService>(OriginsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
