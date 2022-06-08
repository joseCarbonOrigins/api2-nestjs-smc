import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OriginsModule } from './origins/origins.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';

import { environments } from './environments';
import { ExternalModule } from './external/external.module';
import { CronjobModule } from './cronjob/cronjob.module';
import { DummyModule } from './dummy/dummy.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV] || '.env',
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
      }),
    }),
    OriginsModule,
    DashboardModule,
    DatabaseModule,
    ExternalModule,
    CronjobModule,
    DummyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
