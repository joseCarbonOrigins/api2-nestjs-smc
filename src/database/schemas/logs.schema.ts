import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Logs extends Document {
  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  date: Date;

  type: string;

  @Prop({ type: Object })
  body: any;
}

export const LogsSchema = SchemaFactory.createForClass(Logs);
