import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';

export class SkipstersQueryDto {
  @IsDate()
  @ApiProperty()
  readonly initialDate: Date;
  @IsDate()
  @ApiProperty()
  readonly endingDate: Date;
}
