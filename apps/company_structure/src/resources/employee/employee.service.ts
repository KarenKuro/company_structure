import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DepatrmentEntity, EmployeeEntity } from '@common/database';
import { FileHelpers, ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IEmployee, IPagination } from '@common/models';

import { FileService } from '@shared/file';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly _employeeRepository: Repository<EmployeeEntity>,

    @InjectRepository(DepatrmentEntity)
    private readonly _departmentRepository: Repository<DepatrmentEntity>,

    private readonly _fileService: FileService,
  ) {}

  async findAll(pagination: IPagination): Promise<IEmployee[]> {
    const { offset, limit } = pagination;
    const employees = await this._employeeRepository.find({
      skip: +offset,
      take: +limit,
      relations: ['department'],
    });

    if (!employees.length) {
      throw (
        (ResponseManager.buildError(ERROR_MESSAGES.EMPLOYEES_NOT_EXISTS),
        HttpStatus.BAD_REQUEST)
      );
    }

    const correctEmployees = employees.map((employee) => {
      const departmentId = employee.department?.id ?? null;
      return { ...employee, department: departmentId };
    });

    return correctEmployees;
  }

  async findOne(param: Partial<IEmployee>): Promise<IEmployee> {
    const employee = await this._employeeRepository.findOne({
      where: { id: param.id },
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

  async findByName(param: Partial<IEmployee>): Promise<IEmployee[]> {
    const employees = await this._employeeRepository.find({
      where: { lastName: param.lastName },
      relations: ['department'],
    });

    if (!employees.length) {
      throw (
        (ResponseManager.buildError(ERROR_MESSAGES.EMPLOYEES_NOT_EXISTS),
        HttpStatus.BAD_REQUEST)
      );
    }

    const correctEmployees = employees.map((employee) => {
      const departmentId = employee.department?.id ?? null;
      return { ...employee, department: departmentId };
    });

    return correctEmployees;
  }

  async findByDepartment(param: Partial<IEmployee>): Promise<IEmployee[]> {
    const employees = await this._employeeRepository.find({
      where: {
        department: { id: +param.id },
      },
      relations: ['department'],
    });

    const correctEmployees = employees.map((employee) => {
      const departmentId = employee.department?.id ?? null;
      return { ...employee, department: departmentId };
    });

    return correctEmployees;
  }

  async create(body: Partial<IEmployee>, path: string) {
    let filePath = path;

    try {
      const department = await this._departmentRepository.findOne({
        where: { id: body.department },
      });

      if (!department) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.DEPARTMENT_NOT_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this._employeeRepository.save({
        firstName: body.firstName,
        patronymic: body.patronymic,
        lastName: body.lastName,
        photo: filePath,
        jobTitle: body.jobTitle,
        salary: +body.salary,
        age: +body.age,
        department: +body.department as Partial<DepatrmentEntity>,
      });
    } catch (err) {
      const removedFilePath = FileHelpers.removeHostFromPath(filePath);
      await this._fileService.removeFile(removedFilePath);

      throw ResponseManager.buildError(
        ERROR_MESSAGES.FAILED_TO_CREATE_EMPLOYEE,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(param: Partial<IEmployee>): Promise<IEmployee> {
    try {
      const employee = await this.findOne({ id: param.id });

      if (!employee || !employee.photo) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.EMPLOYEE_NOT_EXISTS,
          HttpStatus.NOT_FOUND,
        );
      }

      const removedFilePath = FileHelpers.removeHostFromPath(employee.photo);
      await this._fileService.removeFile(removedFilePath);

      await this._employeeRepository.delete(param.id);
      return employee;
    } catch (err) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.FAILED_TO_REMOVE_EMPLOYEE,
      );
    }
  }
}
