import { DepatrmentEntity, EmployeeEntity } from '@common/database';
import { FileHelpers, ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IEmployee } from '@common/models';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from '@shared/file';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly _employeeRepository: Repository<EmployeeEntity>,

    @InjectRepository(DepatrmentEntity)
    private readonly _departmentRepository: Repository<DepatrmentEntity>,

    private readonly _fileService: FileService,
  ) {}

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

  async findOneByName(param: Partial<IEmployee>): Promise<IEmployee> {
    const employee = await this._employeeRepository.findOne({
      where: { lastName: param.lastName },
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

  async findOneByDepartment(param: Partial<IEmployee>): Promise<IEmployee> {
    const employee = await this._employeeRepository.findOne({
      where: { department: param.department as Partial<DepatrmentEntity> },
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
        salary: body.salary,
        age: body.age,
        department: body.department as Partial<DepatrmentEntity>,
      });
    } catch (err) {
      const removedFilePath = FileHelpers.removeHostFromPath(filePath);
      await this._fileService.removeFile(removedFilePath);

      console.error(err);
      throw ResponseManager.buildError(
        ERROR_MESSAGES.DEPARTMENT_ALREADY_EXISTS,
      );
    }
  }

  async remove(param: Partial<IEmployee>): Promise<IEmployee> {
    const employee = await this.findOne({ id: param.id });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${param.id} not found`);
    }

    const removedFilePath = FileHelpers.removeHostFromPath(employee.photo);
    await this._fileService.removeFile(removedFilePath);

    await this._departmentRepository.delete({ id: param.id });
    return employee;
  }
}
