import { Test, TestingModule } from '@nestjs/testing';
import { OriginsController } from './origins.controller';

describe('OriginsController', () => {
  let controller: OriginsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OriginsController],
    }).compile();

    controller = module.get<OriginsController>(OriginsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
