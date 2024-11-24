import { ApiProperty } from '@nestjs/swagger';
import { DepartmentResponseDTO } from './department-response.dto';

export class DepartmentWithStatsResponseDTO extends DepartmentResponseDTO {
  @ApiProperty()
  employeeCount: number;

  @ApiProperty()
  totalSalary: number;
}
