import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Bool } from 'aws-sdk/clients/clouddirectory';
import { Document, Types } from 'mongoose';
import { Skipster } from './skipster.schema';

@Schema()
export class Log extends Document {
  @Prop({ required: true })
  loginTime: Date;

  @Prop({ required: true })
  logoutTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Skipster', required: true })
  skipster_id: Skipster | Types.ObjectId;

  @Prop({ required: false })
  disconnection: Bool;
}

export const LogSchema = SchemaFactory.createForClass(Log);
