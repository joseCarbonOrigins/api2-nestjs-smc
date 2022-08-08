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

  @Prop({ required: true, default: [1, 2, 3, 4, 5] })
  cameras_arrangement: number[];

  @Prop({ required: false })
  short_id: string;

  @Prop({ required: true })
  ip_address: string;
}

export const SkippySchema = SchemaFactory.createForClass(Skippy);
