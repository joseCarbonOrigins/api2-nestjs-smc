import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Skip } from './skip.schema';
import { Skipster } from './skipster.schema';

@Schema()
export class Mission extends Document {
  @Prop()
  mission_name: string;

  @Prop()
  mission_xp: number;

  @Prop()
  mission_coins: number;

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
  start_point: Record<string, number[]>;

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
  ending_point: Record<string, number[]>;

  @Prop()
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop()
  estimated_time: number;

  // maybe remove
  @Prop()
  start_address_name: string;

  @Prop({ required: true })
  ending_address_name: string;

  @Prop({ type: Types.ObjectId, ref: 'Skipster' })
  skipster_id: Skipster | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Skip', required: true })
  skip_id: Skip | Types.ObjectId;

  @Prop({ required: true })
  mission_completed: boolean;

  @Prop({ required: true })
  previous_mission_completed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Mission' })
  previous_mission_id: Mission | Types.ObjectId;

  @Prop({ default: false })
  mock: boolean;

  @Prop({ default: 0 })
  driving_time: number;
}

export const MissionSchema = SchemaFactory.createForClass(Mission);
