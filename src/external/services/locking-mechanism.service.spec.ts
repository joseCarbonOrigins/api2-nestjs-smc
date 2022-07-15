import { Test, TestingModule } from '@nestjs/testing';
import { LockingMechanismService } from './locking-mechanism.service';

describe('LockingMechanismService', () => {
  let service: LockingMechanismService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LockingMechanismService],
    }).compile();

    service = module.get<LockingMechanismService>(LockingMechanismService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
