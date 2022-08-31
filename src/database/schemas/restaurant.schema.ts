import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Restaurant extends Document {
  @Prop({ required: true, unique: true })
  rid: number;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'https://i.pravatar.cc/300' })
  logo: string;

  @Prop({ required: true })
  delivery: boolean;

  @Prop({ required: true })
  takeout: boolean;

  @Prop({ required: true })
  address1: string;

  @Prop({ required: false, default: '' })
  address2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  zip: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: false, default: 'No Special Instructions' })
  special_instructions: string;

  @Prop({ required: true, default: 2022 })
  unlock_code: number;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
