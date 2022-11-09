import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Logs extends Document {
  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  extraFields: any;
}

export const LogsSchema = SchemaFactory.createForClass(Logs);
