import { DepatrmentEntity, EmployeeEntity } from '@common/database';
import { IAllDepartments } from '@common/models';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepatrmentEntity)
    private readonly _departmentRepository: Repository<DepatrmentEntity>,

    @InjectRepository(EmployeeEntity)
    private readonly _employeeRepository: Repository<EmployeeEntity>,
  ) {}

  async findAll(): Promise<IAllDepartments> {
    return null;
  }
}
