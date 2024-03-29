import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Skipster_Type, Status } from './enums';
@Schema()
export class Skipster extends Document {
  @Prop({ required: true, unique: true })
  nickname: string;

  @Prop({ required: true })
  status: Status;

  @Prop()
  lastSeen: Date;

  @Prop()
  picture: string;

  @Prop({ required: true, default: 0 })
  experience: number;

  @Prop({ required: true, default: 1 })
  level: number;

  @Prop({ required: false, default: 0 })
  driving_time: number;

  @Prop({ required: false, default: 0 })
  disconnections: number;

  @Prop({ required: true, default: 10 })
  base_salary: number;

  @Prop({ ref: 'Mission', default: [] })
  missions: [Types.ObjectId];

  @Prop({ ref: 'Log', default: [] })
  logs: [Types.ObjectId];

  @Prop(
    raw({
      name: {
        type: String,
        // required: true,
      },
      last_name: {
        type: String,
        // required: true,
      },
      country: {
        type: String,
        // required: false,
        default: 'USA',
      },
      picture: {
        type: String,
        // required: false,
        default: 'https://i.imgur.com/XqQXQ.png',
      },
    }),
  )
  personal_information: Record<any, any>;

  @Prop({ required: true, default: 'shift' })
  type: Skipster_Type;
}

export const SkipsterSchema = SchemaFactory.createForClass(Skipster);
