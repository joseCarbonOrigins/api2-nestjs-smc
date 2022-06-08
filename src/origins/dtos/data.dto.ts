import {
  IsNotEmpty,
  IsString,
  IsPositive,
  IsNumber,
  IsDate,
  IsBoolean,
  IsArray,
  IsEmail,
} from 'class-validator';

export class SkipsterCreate {
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsDate()
  lastSeen?: Date;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  experience: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  level: number;
}

export class SkipsterQuery {
  @IsString()
  nickname?: string;
}

export class SkippysQuery {
  @IsEmail()
  email?: string;

  @IsString()
  status?: string;

  @IsString()
  current_skip_id?: string;
}

export class SkippyUpdate {
  @IsString()
  mission?: string;

  location?: Location;

  @IsString()
  status?: string;

  @IsString()
  current_skip_id?: string;
}

export class MissionUpdate {
  @IsString()
  skipster_id?: string;

  @IsDate()
  startTime?: Date;

  @IsDate()
  endTime?: Date;

  @IsBoolean()
  mission_completed?: boolean;

  @IsBoolean()
  previous_mission_completed?: boolean;
}

export class MissionsQuery {
  @IsString()
  _id?: string;

  @IsBoolean()
  mission_completed?: boolean;

  @IsBoolean()
  previous_mission_completed?: boolean;

  @IsString()
  previous_mission_id?: string;

  @IsString()
  skipster_id?: string;
}

export class MissionCreate {
  @IsString()
  mission_name?: string;

  @IsNotEmpty()
  start_point: Location;

  @IsNotEmpty()
  ending_point: Location;

  @IsString()
  start_address_name?: string;

  @IsNotEmpty()
  @IsString()
  ending_address_name: string;

  @IsNotEmpty()
  @IsString()
  skip_id: string;

  @IsNumber()
  @IsPositive()
  mission_xp: number;

  @IsNumber()
  @IsPositive()
  mission_coins: number;

  @IsNumber()
  @IsPositive()
  estimated_time?: number;

  @IsNotEmpty()
  @IsBoolean()
  mission_completed: boolean;

  @IsNotEmpty()
  @IsBoolean()
  previous_mission_completed: boolean;

  @IsNotEmpty()
  @IsString()
  previous_mission_id: string;

  @IsNotEmpty()
  @IsBoolean()
  mock: boolean;
}

export class SkipCreate {
  @IsNotEmpty()
  @IsDate()
  startTime: Date;

  @IsNotEmpty()
  @IsString()
  skippy_id: string;

  @IsNotEmpty()
  order_info: OrderInfo;

  @IsNotEmpty()
  @IsBoolean()
  mock: boolean;
}

// +++++++++++++++++++++++++++=
class OrderInfo {
  @IsNotEmpty()
  @IsNumber()
  order_id: number;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  customer: Customer;

  @IsNotEmpty()
  restaurant: Restaurant;
}

class Customer {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  long: number;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsString()
  zip?: string;
}

class Restaurant {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  long: number;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsString()
  zip?: string;
}

class Location {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsArray()
  coordinates: number[];
}
