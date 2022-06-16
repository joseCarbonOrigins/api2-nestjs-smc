import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MissionQueryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly mission_id: string;
}
