import { Module } from '@nestjs/common';
import { DummyController } from './controllers/dummy.controller';
import { DummyService } from './services/dummy.service';

@Module({
  controllers: [DummyController],
  providers: [DummyService]
})
export class DummyModule {}
