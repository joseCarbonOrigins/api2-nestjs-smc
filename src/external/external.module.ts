/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module, Global } from '@nestjs/common';
import { DeliverLogicService } from './services/deliver-logic.service';
import { HttpModule } from '@nestjs/axios';
import { TwilioService } from './services/twilio.service';
import { LambdaService } from './services/lambda.service';
import { LockingMechanismService } from './services/locking-mechanism.service';
import { FunctionsService } from './services/functions.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    DeliverLogicService,
    TwilioService,
    LambdaService,
    LockingMechanismService,
    FunctionsService,
  ],
  exports: [
    DeliverLogicService,
    TwilioService,
    LambdaService,
    LockingMechanismService,
    FunctionsService,
  ],
})
export class ExternalModule {}
