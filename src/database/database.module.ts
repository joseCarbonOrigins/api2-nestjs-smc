import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import config from '../config';
// schemas
import { Skipster, SkipsterSchema } from './schemas/skipster.schema';
import { Log, LogSchema } from './schemas/log.schema';
import { Mission, MissionSchema } from './schemas/mission.schema';
import { Skip, SkipSchema } from './schemas/skip.schema';
import { Skippy, SkippySchema } from './schemas/skippy.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Skipster.name,
        schema: SkipsterSchema,
      },
      {
        name: Log.name,
        schema: LogSchema,
      },
      {
        name: Mission.name,
        schema: MissionSchema,
      },
      {
        name: Skip.name,
        schema: SkipSchema,
      },
      {
        name: Skippy.name,
        schema: SkippySchema,
      },
    ]),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigType<typeof config>) => ({
        uri: configService.database.mongo_uri,
      }),
      inject: [config.KEY],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
