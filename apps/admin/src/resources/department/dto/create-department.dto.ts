import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateDepartmentDTO {
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
  @IsOptional()
  @ApiProperty()
  director?: number;
}
