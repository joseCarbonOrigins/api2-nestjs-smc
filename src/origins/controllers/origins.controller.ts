/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Post,
  Header,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// serivices
import { OriginsService } from '../services/origins.service';
// dtos
import {
  PickMissionDto,
  UpdateMissionOrderStatusDto,
  UpdateMissionStatus,
  AcceptDeclineMissionDto,
} from '../dtos/missions.dto';
import { CamerasArrangementDto } from '../dtos/skippy.dto';
import { SubmitEventDto } from '../dtos/event.dto';
import { SentryInterceptor } from '../../interceptors/sentry.interceptor';

@UseInterceptors(SentryInterceptor)
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

  // @ApiOperation({ summary: 'Old endpoint: update order status' })
  // @Put('skippy/:skippyname/:orderid/:status')
  // @Header('Access-Control-Allow-Origin', '*')
  // oldUpdateOrderStatus(
  //   @Param('skippyname') skippyname: string,
  //   @Param('orderid') orderid: number,
  //   @Param('status') status: string,
  // ) {
  //   return this.originsService.oldUpdateOrderStatus(
  //     skippyname,
  //     orderid,
  //     status,
  //   );
  // }

  // end mission1
  @ApiOperation({
    summary: 'When food is placed. This endpoint will end mission-1',
  })
  @Patch('missions/food-placed')
  @Header('Access-Control-Allow-Origin', '*')
  foodPlaced(@Body() payload: UpdateMissionStatus) {
    return this.originsService.foodPlaced(payload);
  }

  // end mission2
  @ApiOperation({
    summary:
      'When food is delivered to customer. This endpoint will end mission-2',
  })
  @Patch('missions/food-delivered')
  @Header('Access-Control-Allow-Origin', '*')
  foodDelivered(@Body() payload: UpdateMissionStatus) {
    return this.originsService.foodDelivered(payload);
  }

  // end mission3
  @ApiOperation({
    summary:
      'When skippy arrieved Twin Ignition (home). This endpoint will end mission-3',
  })
  @Patch('missions/back-to-home')
  @Header('Access-Control-Allow-Origin', '*')
  backToHome(@Body() payload: UpdateMissionStatus) {
    return this.originsService.backToHome(payload);
  }

  @ApiOperation({ summary: 'Unassign a mission' })
  @Post('missions/unassign')
  @Header('Access-Control-Allow-Origin', '*')
  unassignMission(@Body() payload: UpdateMissionStatus) {
    return this.originsService.unassignMission(payload);
  }

  @ApiOperation({ summary: 'Accept a mission' })
  @Post('missions/accept')
  @Header('Access-Control-Allow-Origin', '*')
  acceptMission(@Body() payload: AcceptDeclineMissionDto) {
    return this.originsService.acceptMission(payload);
  }

  @ApiOperation({ summary: 'Decline a mission' })
  @Post('missions/decline')
  @Header('Access-Control-Allow-Origin', '*')
  declineMission(@Body() payload: AcceptDeclineMissionDto) {
    return this.originsService.declineMission(payload);
  }

  @ApiOperation({ summary: 'Get skippy data' })
  @Get('skippy/:skippyname')
  @Header('Access-Control-Allow-Origin', '*')
  getSkippyData(@Param('skippyname') skippyname: string) {
    return this.originsService.getSkippyData(skippyname);
  }

  @ApiOperation({ summary: 'Set skippys cameras arrangement' })
  @Post('skippy/:skippyname/cameras')
  @Header('Access-Control-Allow-Origin', '*')
  setSkippyCameras(
    @Param('skippyname') skippyname: string,
    @Body() arrange: CamerasArrangementDto,
  ) {
    return this.originsService.setSkippyCameras(skippyname, arrange);
  }

  @ApiOperation({ summary: 'Get all skippies data' })
  @Get('skippy')
  @Header('Access-Control-Allow-Origin', '*')
  getAllSkippies() {
    return this.originsService.getAllSkippies();
  }

  @ApiOperation({ summary: 'Submit events' })
  @Post('event')
  @Header('Access-Control-Allow-Origin', '*')
  submitEvent(@Body() payload: SubmitEventDto) {
    return this.originsService.submitEvent(payload);
  }

  @ApiOperation({ summary: 'Receive skippys orders' })
  @Post('sms')
  @Header('Access-Control-Allow-Origin', '*')
  testSMS(@Body() payload: any) {
    return this.originsService.testSMS(payload);
  }
}
