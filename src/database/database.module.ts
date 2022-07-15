import { Global, Module, forwardRef } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import config from '../config';
// schemas
import { Skippy, SkippySchema } from './schemas/skippy.schema';
import { Skip, SkipSchema } from './schemas/skip.schema';
import { Skipster, SkipsterSchema } from './schemas/skipster.schema';
import { Log, LogSchema } from './schemas/log.schema';
import { Mission, MissionSchema } from './schemas/mission.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Skippy.name,
        schema: SkippySchema,
      },
      {
        name: Skip.name,
        schema: SkipSchema,
      },
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
