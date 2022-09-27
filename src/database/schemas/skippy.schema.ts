import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Mission_State, Status, Skippy_Type, enumValues } from './enums';

@Schema()
export class Skippy extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    default: 'waiting_order',
    enum: enumValues(Mission_State),
  })
  mission: string;

  @Prop({ default: 'active', enum: enumValues(Status) })
  status: string;

  @Prop({ default: null })
  current_skip_id: Types.ObjectId;

  @Prop(
    raw({
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [45.0006638, -93.270256],
      },
    }),
  )
  location: Record<string, number[]>;

  @Prop({ ref: 'Skip', default: [] })
  skips: [Types.ObjectId];

  @Prop({ ref: 'Mission', default: [] })
  missions: [Types.ObjectId];

  @Prop({ default: [1, 2, 3, 4] })
  cameras_arrangement: number[];

  @Prop({ required: false })
  short_id: string;

  @Prop({ default: '192.68.0.1' })
  ip_address: string;

  @Prop({ default: 'skippy-' })
  agora_channel: string;

  @Prop({ default: '000-000-0000' })
  phone_number: string;

  @Prop({
    default: 'skippy',
    enum: enumValues(Skippy_Type),
  })
  type: string;

}
export const SkippySchema = SchemaFactory.createForClass(Skippy);
