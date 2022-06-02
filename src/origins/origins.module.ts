import { Module } from '@nestjs/common';
import { OriginsController } from './controllers/origins.controller';
import { OriginsService } from './services/origins.service';
import { OriginsDaoService } from './data/origins-dao.service';

@Module({
  controllers: [OriginsController],
  providers: [OriginsService, OriginsDaoService],
})
export class OriginsModule {}
