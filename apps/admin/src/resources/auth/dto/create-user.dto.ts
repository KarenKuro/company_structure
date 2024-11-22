import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDTO {
  @Transform(({ value }) => {
    return value?.trim();
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isAdmin: boolean;
}
