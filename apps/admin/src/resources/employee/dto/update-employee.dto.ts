import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class UpdateEmployeeDTO {
  @Transform(({ value }) => {
    return value?.trim();
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @Transform(({ value }) => {
    return value?.trim();
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  patronymic: string;

  @Transform(({ value }) => {
    return value?.trim();
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @Transform(({ value }) => {
    return value?.trim();
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  jobTitle: string;

  @IsPositive()
  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @IsNotEmpty()
  @ApiProperty()
  salary: number;

  @IsPositive()
  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @IsNotEmpty()
  @ApiProperty()
  age: number;

  @IsPositive()
  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @IsNotEmpty()
  @ApiProperty()
  department: number;
}
