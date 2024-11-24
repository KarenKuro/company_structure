import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class UpdateDepartmentDTO {
  @Transform(({ value }) => {
    return value?.trim();
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsPositive()
  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @IsNotEmpty()
  @ApiProperty()
  director: number;
}
