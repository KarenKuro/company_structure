import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsNumberString } from 'class-validator';

export class IdDTO {
  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  id: string;
}
