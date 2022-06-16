import { Body, Controller, Post } from '@nestjs/common';
// services
import { DummyService } from '../services/dummy.service';

@Controller('dummy')
export class DummyController {
  constructor(private dumyService: DummyService) {}

  @Post('missions')
  createDummyMissions(@Body() payload: any) {
    return this.dumyService.createDummyMissions(payload);
  }
}
