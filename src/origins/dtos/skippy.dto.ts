import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CamerasArrangementDto {
  @IsNotEmpty()
  @ApiProperty()
  readonly cameras: number[];
}
