import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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

// export class UpdateMissionOrderStatusDto {
//   @IsString()
//   @IsNotEmpty()
//   @ApiProperty()
//   readonly status: string;

//   @IsNumber()
//   @IsPositive()
//   @IsNotEmpty()
//   @ApiProperty()
//   readonly orderid: number;

//   @IsString()
//   @ApiProperty()
//   readonly skippyname: string;

//   @ApiProperty()
//   readonly location: object;

//   @ApiProperty()
//   readonly mission_id: string;
// }
