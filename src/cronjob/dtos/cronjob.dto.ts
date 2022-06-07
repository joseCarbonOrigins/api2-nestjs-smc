import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEmail,
  IsDate,
  IsBoolean,
} from 'class-validator';

export class Cronjob {
  @IsNotEmpty()
  @ApiProperty()
  orders: Order[];
}

class Order {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  skippyEmail: string;

  @ApiProperty()
  customer?: Customer;

  @ApiProperty()
  restaurant?: Restaurant;

  @ApiProperty()
  orderInfo?: orderInfo;

  @IsBoolean()
  @ApiProperty()
  data?: boolean;
}

class Customer {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lastName: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  long: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  address: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  zip: string;
}

class Restaurant {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  long: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  address: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  zip: string;
}

class orderInfo {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  status: string;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty()
  driverPickup: Date;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty()
  orderduetime: Date;
}
