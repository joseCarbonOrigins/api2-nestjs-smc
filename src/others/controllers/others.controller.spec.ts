import { Test, TestingModule } from '@nestjs/testing';
import { OthersController } from './others.controller';

describe('OthersController', () => {
  let controller: OthersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OthersController],
    }).compile();

    controller = module.get<OthersController>(OthersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
