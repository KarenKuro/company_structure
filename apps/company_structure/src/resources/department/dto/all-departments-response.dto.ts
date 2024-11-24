import { DepartmentWithStatsResponseDTO } from '@common/dtos';
import { ApiProperty } from '@nestjs/swagger';

export class AllDepartmentsResponseDTO {
  @ApiProperty()
  departments: DepartmentWithStatsResponseDTO;
}
