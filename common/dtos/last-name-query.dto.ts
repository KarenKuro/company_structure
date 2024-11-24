import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty } from 'class-validator';

export class LastNameQueryDTO {
  @ApiProperty()
  @IsNotEmpty()
  lastName: string;
}
