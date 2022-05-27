import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [HttpModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
