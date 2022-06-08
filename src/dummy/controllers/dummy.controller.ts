import { Body, Controller, Post } from '@nestjs/common';
// services
import { DummyService } from '../services/dummy.service';

@Controller('dummy')
export class DummyController {
  constructor(private dumyyService: DummyService) {}

  @Post('missions')
  getAvailableMissions(@Body() payload: any) {
    return this.dumyyService.getAvailableMissions(payload);
  }
}
