import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthUserGuard } from '@common/guards';
import { EmployeeResponseDTO, IdDTO, SuccessDTO } from '@common/dtos';
import { AuthUser } from '@common/decorators';
import { ITokenPayload } from '@common/models';
import { FileHelpers, ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { Folder } from '@common/enums';

import { FileService } from '@shared/file';

import { EmployeeService } from './employee.service';
import { UpdateEmployeeDTO } from './dto';

@Controller('employee')
@UseGuards(AuthUserGuard())
@ApiTags('Employee')
@ApiBearerAuth()
export class EmployeeController {
  constructor(
    private readonly _employeeService: EmployeeService,
    private readonly _fileService: FileService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by id' })
  async findOneById(
    @AuthUser() user: ITokenPayload,
    @Param() param: IdDTO,
  ): Promise<EmployeeResponseDTO> {
    if (!user.isAdmin) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.USER_IS_NOT_ADMIN,
        HttpStatus.FORBIDDEN,
      );
    }

    const employee = await this._employeeService.findOne({ id: +param.id });

    if (employee.photo) {
      employee.photo = FileHelpers.generatePath(employee.photo);
    }

    if (!employee) {
      throw (
        (ResponseManager.buildError(ERROR_MESSAGES.EMPLOYEE_NOT_EXISTS),
        HttpStatus.BAD_REQUEST)
      );
    }

    return employee;
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Update employee by id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update employee and upload file',
    type: UpdateEmployeeDTO,
  })
  @ApiResponse({ status: 201, type: SuccessDTO })
  async update(
    @AuthUser() user: ITokenPayload,
    @Param() param: IdDTO,
    @Body() body: UpdateEmployeeDTO,
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
    const employee = await this.findOneById(user, param);
    
    const removedFilePath = FileHelpers.removeHostFromPath(employee.photo);
    await this._fileService.removeFile(removedFilePath);

    const filePath = await this._fileService.saveFile(file, Folder.EMPLOYEE);

    await this._employeeService.update(employee, body, filePath);

    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee by id' })
  async remove(
    @AuthUser() user: ITokenPayload,
    @Param() param: IdDTO,
  ): Promise<void> {
    if (!user.isAdmin) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.USER_IS_NOT_ADMIN,
        HttpStatus.FORBIDDEN,
      );
    }

    await this._employeeService.remove({ id: +param.id });
  }
}