/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Types } from 'mongoose';
import {
  Environment,
  Event_Type,
  Platform_Name,
} from 'src/database/schemas/enums';

export class SubmitEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  skipster_nickname: string;

  @ApiProperty()
  date: Date;

  @IsString()
  @ApiProperty({
    description: 'Event Type',
    required: true,
  })
  type: string;

  @ApiProperty()
  data: string;

  @ApiProperty()
  platform: {
    name: {
      type: Platform_Name;
      required: true;
    };
    environment: {
      type: Environment;
      required: true;
    };
    version: {
      type: string;
    };
  };
}

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly name: string;
}
