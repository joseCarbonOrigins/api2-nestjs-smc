import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OriginsController } from './controllers/origins.controller';
import { OriginsService } from './services/origins.service';

@Module({
  imports: [HttpModule],
  controllers: [OriginsController],
  providers: [OriginsService],
})
export class OriginsModule {}
