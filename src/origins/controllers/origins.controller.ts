import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
// serivices
import { OriginsService } from '../services/origins.service';

@Controller('origins')
export class OriginsController {
  constructor(private originsService: OriginsService) {}

  @Get('order/:skippyname')
  getSkippyOrder(@Param('skippyname') skippyname: string) {
    return this.originsService.getSkippyOrder(skippyname);
  }

  @Patch('missions/update-status')
  updateMissionOrderStatus(@Body() payload: any) {
    return this.originsService.updateMissionOrderStatus(payload);
  }
}
