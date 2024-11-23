import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EmployeeEntity } from '@common/database';
import { IEmployee } from '@common/models';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly _employeeRepository: Repository<EmployeeEntity>,
  ) {}

  async findOne(param: Partial<IEmployee>): Promise<IEmployee> {
    const employee = await this._employeeRepository.findOne({
      where: { id: param.id },
      relations: ['department'],
    });

    const departmentId = employee.department.id;

    return { ...employee, department: departmentId };
  }

  async remove(employee: Partial<IEmployee>): Promise<void> {
    await this._employeeRepository.delete(employee.id);
  }
}
