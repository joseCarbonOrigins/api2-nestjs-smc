import { Test, TestingModule } from '@nestjs/testing';
import { OthersService } from './others.service';

describe('OthersService', () => {
  let service: OthersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OthersService],
    }).compile();

    service = module.get<OthersService>(OthersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
