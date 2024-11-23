import { ApiProperty } from "@nestjs/swagger";

export class EmployeeResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  patronymic: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  photo: string;

  @ApiProperty()
  jobTitle: string;

  @ApiProperty()
  salary: number;

  @ApiProperty()
  age: number;

  @ApiProperty()
  department: number;
}
