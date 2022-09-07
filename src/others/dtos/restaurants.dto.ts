import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsPositive,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class RestaurantDto {
  @ApiProperty({
    description: 'Restaurant ID',
    required: true,
    type: Number,
    uniqueItems: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  rid: number;

  @ApiProperty({
    description: 'Restaurant name',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Restaurant logo',
    required: false,
    default: 'https://i.pravatar.cc/300',
    type: String,
  })
  @IsString()
  logo: string;

  @ApiProperty({
    description: 'Restaurant delivery',
    required: true,
    type: Boolean,
  })
  @IsNotEmpty()
  @IsBoolean()
  delivery: boolean;

  @ApiProperty({
    description: 'Restaurant takeout',
    required: true,
    type: Boolean,
  })
  @IsNotEmpty()
  @IsBoolean()
  takeout: boolean;

  @ApiProperty({
    description: 'Restaurant address 1',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  address1: string;

  @ApiProperty({
    description: 'Restaurant address 2',
    required: false,
    default: '',
    type: String,
  })
  @IsString()
  address2: string;

  @ApiProperty({
    description: 'Restaurant city',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Restaurant state',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Restaurant zip',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  zip: string;

  @ApiProperty({
    description: 'Restaurant phone',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Restaurant latitude',
    required: true,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Restaurant longitude',
    required: true,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Restaurant special instructions',
    required: false,
    default: 'No Special Instructions',
    type: String,
  })
  @IsString()
  special_instructions: string;

  @ApiProperty({
    description: 'Restaurant unlock code',
    required: false,
    type: Number,
    default: 2022,
  })
  @IsNotEmpty()
  @IsNumber()
  unlock_code: number;
}
