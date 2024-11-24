import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { IDepartment } from '@common/models';
import { ERROR_MESSAGES } from '@common/messages';
import { ResponseManager } from '@common/helpers';
import { DepatrmentEntity, EmployeeEntity } from '@common/database';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepatrmentEntity)
    private readonly _departmentRepository: Repository<DepatrmentEntity>,

    @InjectRepository(EmployeeEntity)
    private readonly _employeeRepository: Repository<EmployeeEntity>,
  ) {}

  async findOne(param: Partial<IDepartment>): Promise<IDepartment> {
    const department = await this._departmentRepository.findOne({
      where: { id: param.id },
      relations: ['director'],
    });

    if (!department) {
      throw (
        (ResponseManager.buildError(ERROR_MESSAGES.DEPARTMENT_NOT_EXISTS),
        HttpStatus.BAD_REQUEST)
      );
    }

    const directorId = department.director?.id ?? null;

    return { ...department, director: directorId };
  }

  async update(department: IDepartment, body: Partial<IDepartment>) {
    try {
      const newDirector = await this._employeeRepository.findOne({
        where: { id: body.director as number },
      });

      if (!newDirector) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.DIRECTOR_NOT_EXISTS,
          HttpStatus.FORBIDDEN,
        );
      }

      await this._departmentRepository.update(department.id, {
        name: body.name,
        director: newDirector,
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to update department');
    }
  }
}
