import { Module, Global } from '@nestjs/common';
import { DeliverLogicService } from './services/deliver-logic.service';
import { HttpModule } from '@nestjs/axios';
import { TwilioService } from './services/twilio.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [DeliverLogicService, TwilioService],
  exports: [DeliverLogicService, TwilioService],
})
export class ExternalModule {}
