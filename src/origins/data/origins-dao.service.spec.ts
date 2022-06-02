import { Test, TestingModule } from '@nestjs/testing';
import { OriginsDaoService } from './origins-dao.service';

describe('OriginsDaoService', () => {
  let service: OriginsDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OriginsDaoService],
    }).compile();

    service = module.get<OriginsDaoService>(OriginsDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
