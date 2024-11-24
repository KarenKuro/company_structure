import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DepartmentService } from '@admin-resources/department';
import { DepatrmentEntity, EmployeeEntity } from '@common/database';
import { IEmployee } from '@common/models';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly _employeeRepository: Repository<EmployeeEntity>,

    private readonly _departmentService: DepartmentService,
  ) {}

  async findOne(param: Partial<IEmployee>): Promise<IEmployee> {
    const employee = await this._employeeRepository.findOne({
      where: { id: param.id },
      relations: ['department'],
    });

    if (!employee) {
      throw (
        (ResponseManager.buildError(ERROR_MESSAGES.EMPLOYEE_NOT_EXISTS),
        HttpStatus.BAD_REQUEST)
      );
    }

    const departmentId = employee.department?.id ?? null;

    return { ...employee, department: departmentId };
  }

  async update(
    employee: IEmployee,
    body: Partial<IEmployee>,
    filePath: string,
  ) {
    try {
      const department = await this._departmentService.findOne({
        id: body.department,
      });

      if (!department) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.DEPARTMENT_NOT_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this._employeeRepository.update(employee.id, {
        firstName: body.firstName,
        patronymic: body.patronymic,
        lastName: body.lastName,
        photo: filePath,
        jobTitle: body.jobTitle,
        salary: body.salary,
        age: body.age,
        department: body.department.toString() as Partial<DepatrmentEntity>,
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to update employee');
    }
  }

  async remove(employee: Partial<IEmployee>): Promise<void> {
    await this._employeeRepository.delete(employee.id);
  }
}
