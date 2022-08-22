import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SkippyModidyDto {
  @IsString()
  @ApiProperty()
  readonly ip_address: string;
}
