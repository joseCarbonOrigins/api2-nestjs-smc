import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Skipster } from './skipster.schema';

@Schema()
export class Log extends Document {
  @Prop({ required: true })
  loginTime: Date;

  @Prop({ required: true })
  logoutTime: Date;

  @Prop({ type: Types.ObjectId, ref: Skipster.name, required: true })
  skipster_id: Skipster | Types.ObjectId;
}

export const LogSchema = SchemaFactory.createForClass(Log);
