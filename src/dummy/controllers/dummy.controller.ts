import { Body, Controller, Header, Post } from '@nestjs/common';
// services
import { DummyService } from '../services/dummy.service';

@Controller('dummy')
export class DummyController {
  constructor(private dumyService: DummyService) {}

  @Post('missions')
  @Header('Access-Control-Allow-Origin', '*')
  createDummyMissions(@Body() payload: any) {
    return this.dumyService.createDummyMissions(payload);
  }
}
