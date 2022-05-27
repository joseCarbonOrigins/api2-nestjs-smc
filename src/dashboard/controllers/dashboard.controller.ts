import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @ApiOperation({ summary: `Get skippys and skipsters information` })
  @Get()
  getDashboardInfo() {
    return this.dashboardService.getDashboardInfo();
  }
}
