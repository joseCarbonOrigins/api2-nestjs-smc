import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Bool } from 'aws-sdk/clients/clouddirectory';
import { Document, Types } from 'mongoose';

@Schema()
export class Logs extends Document {
  @Prop({ required: true })
  createdAd: Date;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: false })
  type: string;

  extraFields: any;
}

export const LogsSchema = SchemaFactory.createForClass(Logs);
