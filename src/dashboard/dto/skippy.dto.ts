import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Skippy_Type } from 'src/database/schemas/enums';

export class SkippyDto {
  @IsString()
  @ApiProperty({
    description: 'Skippy name',
    required: true,
    type: String,
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Skippy email',
    required: true,
    type: String,
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Skippy short id',
    required: false,
    type: String,
  })
  short_id: string;

  @IsString()
  @ApiProperty({
    description: 'Skippy ip',
    required: false,
    type: String,
  })
  ip_address: string;

  @IsString()
  @ApiProperty({
    description: 'Skippy agora channel',
    required: false,
    type: String,
  })
  agora_channel: string;

  @IsString()
  @ApiProperty({
    description: 'Skippy phone',
    required: false,
    type: String,
  })
  phone_number: string;

  @IsString()
  @ApiProperty({
    description: 'Skippy type',
    required: true,
  })
  type: Skippy_Type;
}
