import { Controller, Get } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllDepartmentsResponseDTO } from './dto/all-departments-response.dto';

@Controller('department')
@ApiTags('department')
export class DepartmentController {
  constructor(private readonly _departmentService: DepartmentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  async findAll(): Promise<AllDepartmentsResponseDTO> {
    const allDepartments = await this._departmentService.findAll();
    return allDepartments;
  }
}
