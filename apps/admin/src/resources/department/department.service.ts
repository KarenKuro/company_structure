import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ICreateDepartment, IDepartment } from '@common/models';
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

  async update(
    department: IDepartment,
    body: Partial<IDepartment>,
  ): Promise<void> {
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
      throw ResponseManager.buildError(
        ERROR_MESSAGES.FAILED_TO_UPDATE_DEPARTMENT,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(body: ICreateDepartment): Promise<void> {
    if (body.director) {
      const existingDirector = await this._employeeRepository.findOne({
        where: { id: body.director },
      });

      if (!existingDirector) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.DIRECTOR_NOT_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const existingDepartmentName = await this._departmentRepository.findOne({
      where: { name: body.name },
    });

    if (existingDepartmentName) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.DEPARTMENT_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (body.director) {
      (await this._departmentRepository.save({
        name: body.name,
        director: body.director as EmployeeEntity | unknown,
      })) as DepatrmentEntity;
    } else {
      await this._departmentRepository.save({ name: body.name });
    }
  }
}
