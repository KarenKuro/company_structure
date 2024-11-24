import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthUserGuard } from '@common/guards';
import {
  EmployeeResponseDTO,
  IdDTO,
  LastNameQueryDTO,
  PaginationQueryDTO,
  SuccessDTO,
} from '@common/dtos';
import { Folder } from '@common/enums';

import { FileService } from '@shared/file';

import { CreateEmployeeDTO } from './dto';
import { EmployeeService } from './employee.service';
import { DepartmentService } from '@company_structure-resources/department';
import { FileHelpers, ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Controller('employee')
@UseGuards(AuthUserGuard())
@ApiTags('Employee')
@ApiBearerAuth()
export class EmployeeController {
  constructor(
    private readonly _employeeService: EmployeeService,
    private readonly _departmentService: DepartmentService,
    private readonly _fileService: FileService,
  ) {}

  @Get('lastname')
  @ApiOperation({ summary: 'Get employee by LastName' })
  async findByLastName(
    @Query() query: LastNameQueryDTO,
  ): Promise<EmployeeResponseDTO[]> {
    const employees = await this._employeeService.findByName({
      lastName: query.lastName,
    });

    const employeesWithCorrectFilePath = employees.map((employee) => {
      if (employee.photo) {
        employee.photo = FileHelpers.generatePath(employee.photo);
      }
      return employee;
    });

    return employeesWithCorrectFilePath;
  }

  @Get('department/:id')
  @ApiOperation({ summary: 'Get employees by department id' })
  async findByDepartment(
    @Param() param: IdDTO,
  ): Promise<EmployeeResponseDTO[]> {
    await this._departmentService.findOne({ id: +param.id });

    const employees = await this._employeeService.findByDepartment({
      id: +param.id,
    });

    const employeesWithCorrectFilePath = employees.map((employee) => {
      if (employee.photo) {
        employee.photo = FileHelpers.generatePath(employee.photo);
      }
      return employee;
    });

    return employeesWithCorrectFilePath;
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of employees to skip',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of employees to return',
  })
  async findAll(
    @Query() pagination: PaginationQueryDTO,
  ): Promise<EmployeeResponseDTO[]> {
    const employees = await this._employeeService.findAll(pagination);

    if (!employees.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.EMPLOYEES_NOT_EXISTS);
    }

    const employeesWithCorrectFilePath = employees.map((employee) => {
      if (employee.photo) {
        employee.photo = FileHelpers.generatePath(employee.photo);
      }
      return employee;
    });

    return employeesWithCorrectFilePath;
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Create employee' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: `Create employee and upload photo. 
    ATTENTION!
    It is necessary to add the field "photo" to the fields from the DTO, the value of which will be the uploaded file
    FileTypes: .(jpg | jpeg | png | xml | svg)
    `,
    type: CreateEmployeeDTO,
  })
  @ApiResponse({ status: 201, type: SuccessDTO })
  async create(
    @Body() body: CreateEmployeeDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /.(jpg|jpeg|png|xml)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1000 * 1000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ): Promise<SuccessDTO> {
    const filePath = await this._fileService.saveFile(file, Folder.EMPLOYEE);
    await this._employeeService.create(body, filePath);

    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete employee by id',
  })
  async remove(@Param() param: IdDTO): Promise<SuccessDTO> {
    await this._employeeService.remove({ id: +param.id });

    return { success: true };
  }
}
