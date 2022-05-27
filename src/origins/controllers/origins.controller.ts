import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// serivices
import { OriginsService } from '../services/origins.service';
// dtos
import {
  PickMissionDto,
  UpdateMissionOrderStatusDto,
} from '../dtos/missions.dto';

@ApiTags('Origins')
@Controller('origins')
export class OriginsController {
  constructor(private originsService: OriginsService) {}

  @ApiOperation({ summary: 'Get all available and unassigned missions' })
  @Get('missions')
  getAvailableMissions() {
    return this.originsService.getAvailableMissions();
  }

  @ApiOperation({ summary: 'Pick a mission' })
  @Patch('missions/pick')
  pickAMission(@Body() payload: PickMissionDto) {
    return this.originsService.pickAMission(payload);
  }

  @ApiOperation({ summary: 'Update the order status and mission status' })
  @Patch('missions/update-status')
  updateMissionOrderStatus(@Body() payload: UpdateMissionOrderStatusDto) {
    return this.originsService.updateMissionOrderStatus(payload);
  }

  @ApiOperation({ summary: `Get the current skippy's order` })
  @Get('order/:skippyname')
  getSkippyOrder(@Param('skippyname') skippyname: string) {
    return this.originsService.getSkippyOrder(skippyname);
  }
}
