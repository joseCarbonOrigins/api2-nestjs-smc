import { Body, Controller, Header, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CronjobService } from '../services/cronjob.service';
// dtos
import { Cronjob } from '../dtos/cronjob.dto';

@ApiTags('Cronjob')
@Controller('cronjob')
export class CronjobController {
  constructor(private cronjobService: CronjobService) {}

  @ApiOperation({ summary: 'Receive skippys orders' })
  @Post('orders')
  @Header('Access-Control-Allow-Origin', '*')
  pushSkippysOrders(@Body() orders: Cronjob[]) {
    return this.cronjobService.pushSkippysOrders(orders);
  }
}
