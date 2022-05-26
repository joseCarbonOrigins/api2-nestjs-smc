import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Skipster extends Document {
  @Prop({ required: true, unique: true })
  nickname: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  lastSeen: Date;

  @Prop()
  picture: string;

  @Prop({ required: true })
  experience: number;

  @Prop({ required: true })
  level: number;
}

export const SkipsterSchema = SchemaFactory.createForClass(Skipster);
