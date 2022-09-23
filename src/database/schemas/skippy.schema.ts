import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Mission_State, Status, Skippy_Type } from './enums';

@Schema()
export class Skippy extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, default: 'waiting_order' })
  mission: Mission_State;

  @Prop({ required: false, default: 'active' })
  status: Status;

  @Prop({ required: false, default: null })
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

  @Prop({ required: false, ref: 'Skip', default: [] })
  skips: [Types.ObjectId];

  @Prop({ required: false, ref: 'Mission', default: [] })
  missions: [Types.ObjectId];

  @Prop({ required: false, default: [1, 2, 3, 4] })
  cameras_arrangement: number[];

  @Prop({ required: false })
  short_id: string;

  @Prop({ required: false, default: '192.68.0.1' })
  ip_address: string;

  @Prop({ required: false, default: 'skippy-' })
  agora_channel: string;

  @Prop({ required: false, default: '000-000-0000' })
  phone_number: string;

  @Prop({ required: true, default: 'skippy' })
  type: Skippy_Type;
}

export const SkippySchema = SchemaFactory.createForClass(Skippy);
