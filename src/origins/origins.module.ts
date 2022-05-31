import { Module } from '@nestjs/common';
import { OriginsController } from './controllers/origins.controller';
import { OriginsService } from './services/origins.service';

@Module({
  controllers: [OriginsController],
  providers: [OriginsService],
})
export class OriginsModule {}
