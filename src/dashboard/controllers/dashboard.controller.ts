import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
// dto
import { MissionQueryDto } from '../dto/missions.dto';
import { SkipstersQueryDto } from '../dto/skipsters.dto';
import { SkippyDto } from '../dto/skippy.dto';
import { SkippyModifyDto } from '../dto/skippy.dto';

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

  @ApiOperation({ summary: `Get missions log` })
  @Get('missions/getMissionsLog')
  @Header('Access-Control-Allow-Origin', '*')
  getMissionsLog() {
    return this.dashboardService.getMissionsLog();
  }

  @ApiOperation({ summary: `Get all skipsters time sheet` })
  @Get('skipsters/getSkipstersTimeSheet')
  @Header('Access-Control-Allow-Origin', '*')
  getSkipstersTimeSheet(@Query() query: SkipstersQueryDto) {
    return this.dashboardService.getSkipstersTimeSheet(query);
  }

  @ApiOperation({ summary: `Get skippys and skipsters information` })
  @Get('missions/:skip')
  @Header('Access-Control-Allow-Origin', '*')
  getMissions(@Param('skip') skip: number) {
    return this.dashboardService.getMissions(skip);
  }

  @ApiOperation({ summary: `Get all the missions of a skipster` })
  @Get('missions/skipster/:skipster')
  @Header('Access-Control-Allow-Origin', '*')
  getSkipsterMissions(@Param('skipster') skipster: string) {
    return this.dashboardService.getSkipsterMissions(skipster);
  }

  @ApiOperation({ summary: `Modify skippy's information` })
  @Patch('skippy/:skippyemail')
  @Header('Access-Control-Allow-Origin', '*')
  modifySkippy(
    @Param('skippyemail') skippyemail: string,
    @Body() body: SkippyModifyDto,
  ) {
    return this.dashboardService.modifySkippy(skippyemail, body);
  }

  @ApiOperation({ summary: `Create skippy` })
  @Post('skippy')
  @Header('Access-Control-Allow-Origin', '*')
  createSkippy(@Body() body: SkippyDto) {
    return this.dashboardService.createSkippy(body);
  }

  @ApiOperation({ summary: `TESTING Santi` })
  @Get('testingSantiago')
  @Header('Access-Control-Allow-Origin', '*')
  testingSantiago() {
    return this.dashboardService.testingSantiago();
  }
}
