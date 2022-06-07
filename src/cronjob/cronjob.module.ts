import { Module } from '@nestjs/common';
import { CronjobController } from './controllers/cronjob.controller';
import { CronjobService } from './services/cronjob.service';

@Module({
  controllers: [CronjobController],
  providers: [CronjobService],
})
export class CronjobModule {}
