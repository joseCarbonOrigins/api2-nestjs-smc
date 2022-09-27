/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Event_Type, Platform_Name, Enviroment, enumValues } from './enums';
import { Skipster } from './skipster.schema';

@Schema()
export class Event extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Skipster', required: true })
  skipster_id: Skipster | Types.ObjectId;

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
      enviroment: {
        type: String,
        enum: enumValues(Enviroment),
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
