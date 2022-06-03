import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// serivices
import { OriginsService } from '../services/origins.service';
// dtos
import {
  PickMissionDto,
  UpdateMissionOrderStatusDto,
  UpdateMissionStatus,
} from '../dtos/missions.dto';

@ApiTags('Origins')
@Controller('origins')
export class OriginsController {
  constructor(private originsService: OriginsService) {}

  @ApiOperation({ summary: 'Get all available and unassigned missions' })
  @Get('missions')
  @Header('Access-Control-Allow-Origin', '*')
  getAvailableMissions() {
    return this.originsService.getAvailableMissions();
  }

  @ApiOperation({ summary: 'Pick a mission' })
  @Patch('missions/pick')
  @Header('Access-Control-Allow-Origin', '*')
  pickAMission(@Body() payload: PickMissionDto) {
    return this.originsService.pickAMission(payload);
  }

  @ApiOperation({ summary: 'Update the order status and mission status' })
  @Patch('missions/update-status')
  @Header('Access-Control-Allow-Origin', '*')
  updateMissionOrderStatus(@Body() payload: UpdateMissionOrderStatusDto) {
    return this.originsService.updateMissionOrderStatus(payload);
  }

  @ApiOperation({ summary: `Get the current skippy's order` })
  @Get('order/:skippyname')
  @Header('Access-Control-Allow-Origin', '*')
  getSkippyOrder(@Param('skippyname') skippyname: string) {
    return this.originsService.getSkippyOrder(skippyname);
  }

  @ApiOperation({ summary: 'Old endpoint: update order status' })
  @Put('skippy/:skippyname/:orderid/:status')
  @Header('Access-Control-Allow-Origin', '*')
  oldUpdateOrderStatus(
    @Param('skippyname') skippyname: string,
    @Param('orderid') orderid: number,
    @Param('status') status: string,
  ) {
    return this.originsService.oldUpdateOrderStatus(
      skippyname,
      orderid,
      status,
    );
  }

  @ApiOperation({
    summary: 'When food is placed. This endpoint will end mission-1',
  })
  @Patch('missions/food-placed')
  @Header('Access-Control-Allow-Origin', '*')
  foodPlaced(@Body() payload: UpdateMissionStatus) {
    return this.originsService.foodPlaced(payload);
  }

  @ApiOperation({
    summary:
      'When food is delivered to customer. This endpoint will end mission-2',
  })
  @Patch('missions/food-delivered')
  @Header('Access-Control-Allow-Origin', '*')
  foodDelivered(@Body() payload: UpdateMissionStatus) {
    return this.originsService.foodDelivered(payload);
  }

  @ApiOperation({
    summary:
      'When skippy arrieved Twin Ignition (home). This endpoint will end mission-3',
  })
  @Patch('missions/back-to-home')
  @Header('Access-Control-Allow-Origin', '*')
  backToHome(@Body() payload: UpdateMissionStatus) {
    return this.originsService.backToHome(payload);
  }
}
