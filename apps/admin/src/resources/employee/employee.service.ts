import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DepatrmentEntity, EmployeeEntity } from '@common/database';
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

  async update(
    employee: IEmployee,
    body: Partial<IEmployee>,
    filePath: string,
  ) {
    try {

      const department = body.department;
      // узнать существует ли этот департамент
      
      
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
      throw new InternalServerErrorException('Failed to update user')
    }
  }

  async remove(employee: Partial<IEmployee>): Promise<void> {
    await this._employeeRepository.delete(employee.id);
  }
}
