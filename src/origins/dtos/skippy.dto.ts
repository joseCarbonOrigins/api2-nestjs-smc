import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CamerasArrangementDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsNumber({}, { each: true })
  readonly cameras: number[];
}
