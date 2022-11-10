/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Event_Type, Platform_Name, Environment, enumValues } from './enums';
import { Skipster } from './skipster.schema';

@Schema()
export class Event extends Document {
  @Prop({ required: true })
  skipster_nickname: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ required: true, enum: enumValues(Event_Type) })
  type: string;

  @Prop({ default: '- No data -' })
  data: string;

  @Prop(
    raw({
      name: {
        type: String,
        enum: enumValues(Platform_Name),
        required: true,
      },
      environment: {
        type: String,
        enum: enumValues(Environment),
        required: true,
      },
      version: {
        type: String,
        default: '- No Version -',
      },
    }),
  )
  platform: Record<any, any>;
}

export const EventSchema = SchemaFactory.createForClass(Event);
