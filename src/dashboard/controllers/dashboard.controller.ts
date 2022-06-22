import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
// dto
import { MissionQueryDto } from '../dto/missions.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @ApiOperation({ summary: `Get skippys and skipsters information` })
  @Get()
  @Header('Access-Control-Allow-Origin', '*')
  getDashboardInfo() {
    return this.dashboardService.getDashboardInfo();
  }

  @ApiOperation({ summary: `Get skippys and skipsters information` })
  @Get('missions/:skip')
  @Header('Access-Control-Allow-Origin', '*')
  getMissions(@Param('skip') skip: number) {
    return this.dashboardService.getMissions(skip);
  }

  @ApiOperation({ summary: `Get skippys and skipsters information` })
  @Post('missions/force-finish')
  @Header('Access-Control-Allow-Origin', '*')
  forceFinishMissions(@Body() body: MissionQueryDto) {
    return this.dashboardService.forceFinishMissions(body);
  }

  @ApiOperation({ summary: `Delete mission` })
  @Delete('missions/delete/:mission')
  @Header('Access-Control-Allow-Origin', '*')
  deleteMission(@Param('mission') missionId: string) {
    return this.dashboardService.deleteMission(missionId);
  }
}
