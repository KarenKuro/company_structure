import { DepatrmentEntity, EmployeeEntity } from '@common/database';
import { IAllDepartments } from '@common/models';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepatrmentEntity)
    private readonly _departmentRepository: Repository<DepatrmentEntity>,

    @InjectRepository(EmployeeEntity)
    private readonly _employeeRepository: Repository<EmployeeEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<IAllDepartments> {
    const rawResult = await this.dataSource.query(`
      SELECT
        department.id AS id,
        department.name AS name,
        department.director_id AS director,
        COUNT(employee.id) AS employeeCount,
        COALESCE(SUM(employee.salary), 0) AS totalSalary
      FROM departments AS department
      LEFT JOIN employee AS employee ON employee.department_id = department.id
      GROUP BY department.id, department.name, department.director_id
    `);

    const allDepartmentsWithStats = rawResult.map((department) => ({
      id: department.id,
      name: department.name,
      director: department.director,
      employeeCount: Number(department.employeecount),
      totalSalary: Number(department.totalsalary),
    }));

    return { departments: allDepartmentsWithStats };
  }
}
