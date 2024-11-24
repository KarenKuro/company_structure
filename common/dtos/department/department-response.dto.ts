import { ApiProperty } from '@nestjs/swagger';

export class DepartmentResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  director: number;
}
