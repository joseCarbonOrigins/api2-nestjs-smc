import { Module, Global } from '@nestjs/common';
import { DeliverLogicService } from './services/deliver-logic.service';
import { HttpModule } from '@nestjs/axios';
import { TwilioService } from './services/twilio.service';
import { LambdaService } from './services/lambda.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [DeliverLogicService, TwilioService, LambdaService],
  exports: [DeliverLogicService, TwilioService, LambdaService],
})
export class ExternalModule {}
