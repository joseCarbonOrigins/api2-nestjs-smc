import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// serivices
import { OriginsService } from '../services/origins.service';

@ApiTags('Origins')
@Controller('origins')
export class OriginsController {
  constructor(private originsService: OriginsService) {}

  @Get('missions')
  getAvailableMissions() {
    return this.originsService.getAvailableMissions();
  }

  @Patch('missions/pick')
  pickAMission(@Body() payload: any) {
    return this.originsService.pickAMission(payload);
  }

  @Patch('missions/update-status')
  updateMissionOrderStatus(@Body() payload: any) {
    return this.originsService.updateMissionOrderStatus(payload);
  }

  @Get('order/:skippyname')
  getSkippyOrder(@Param('skippyname') skippyname: string) {
    return this.originsService.getSkippyOrder(skippyname);
  }
}
