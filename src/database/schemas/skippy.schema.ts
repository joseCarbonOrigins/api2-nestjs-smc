import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Skippy extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  mission: string;

  @Prop({ required: true })
  status: string;

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
}

export const SkippySchema = SchemaFactory.createForClass(Skippy);
