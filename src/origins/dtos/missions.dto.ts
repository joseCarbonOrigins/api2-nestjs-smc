import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsPositive, IsNumber } from 'class-validator';

class LocationDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  long: number;
}

export class PickMissionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly mission_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly skipster_nickname: string;
}

export class UpdateMissionOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly status: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty()
  readonly orderid: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly skippyname: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly location: LocationDto;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly mission_id: string;
}
