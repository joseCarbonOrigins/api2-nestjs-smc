import {
  Body,
  Controller,
  Header,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CronjobService } from '../services/cronjob.service';
// dtos
import { Cronjob } from '../dtos/cronjob.dto';
import { SentryInterceptor } from '../../interceptors/sentry.interceptor';

@UseInterceptors(SentryInterceptor)
@ApiTags('Cronjob')
@Controller('cronjob')
export class CronjobController {
  constructor(private cronjobService: CronjobService) {}

  @ApiOperation({ summary: 'Receive skippys orders' })
  @Post('orders')
  @Header('Access-Control-Allow-Origin', '*')
  pushSkippysOrders(@Body() payload: Cronjob) {
    return this.cronjobService.pushSkippysOrders(payload);
  }
}
