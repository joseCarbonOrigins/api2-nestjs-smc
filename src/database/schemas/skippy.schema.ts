import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Mission_State, Status } from './enums';

@Schema()
export class Skippy extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  mission: Mission_State;

  @Prop({ required: true })
  status: Status;

  @Prop()
  current_skip_id: Types.ObjectId;

  @Prop(
    raw({
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    }),
  )
  location: Record<string, number[]>;

  @Prop({ ref: 'Skip', default: [] })
  skips: [Types.ObjectId];

  @Prop({ ref: 'Mission', default: [] })
  missions: [Types.ObjectId];

  @Prop({ required: true, default: [1, 2, 3, 4] })
  cameras_arrangement: number[];

  @Prop({ required: false })
  short_id: string;

  @Prop({ required: true, default: '192.68.0.1' })
  ip_address: string;

  @Prop({ required: true, default: 'skippy-' })
  agora_channel: string;

  @Prop({ required: true, default: '000.000.0000' })
  phone_number: string;
}

export const SkippySchema = SchemaFactory.createForClass(Skippy);
