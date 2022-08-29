import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// schemas
import { Skippy } from './skippy.schema';

@Schema()
export class Skip extends Document {
  @Prop(
    raw({
      order_id: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
      customer: {
        firstName: {
          type: String,
          required: true,
        },
        lastName: {
          type: String,
          required: true,
        },
        lat: {
          type: Number,
          required: true,
        },
        long: {
          type: Number,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        zip: {
          type: String,
        },
        phone: {
          type: String,
          required: true,
        },
      },
      restaurant: {
        name: {
          type: String,
          required: true,
        },
        lat: {
          type: Number,
          required: true,
        },
        long: {
          type: Number,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        zip: {
          type: String,
        },
      },
    }),
  )
  order_info: Record<any, any>;

  @Prop()
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop()
  estimatedTime: number;

  @Prop({ type: Types.ObjectId, ref: 'Skippy', required: true })
  skippy_id: Skippy | Types.ObjectId;

  @Prop({ default: false })
  mock: boolean;

  @Prop({ ref: 'Mission', default: [] })
  missions: [Types.ObjectId];

  @Prop()
  unlock_code: number;
}

export const SkipSchema = SchemaFactory.createForClass(Skip);
