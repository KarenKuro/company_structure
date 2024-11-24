import { AuthUserGuard } from '@common/guards';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileService } from '@shared/file';
import { CreateEmployeeDTO } from './dto';
import { IdDTO, SuccessDTO } from '@common/dtos';
import { AuthUser } from '@common/decorators';
import { ITokenPayload } from '@common/models';
import { Folder } from '@common/enums';
import { EmployeeService } from './employee.service';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Controller('employee')
@UseGuards(AuthUserGuard())
@ApiTags('Employee')
@ApiBearerAuth()
export class EmployeeController {
  constructor(
    private readonly _employeeService: EmployeeService,
    private readonly _fileService: FileService,
  ) {}

  // @Get(':id')
  // @ApiOperation({ summary: 'Get employee by id' })
  // async findOneById(
  //   @AuthUser() user: ITokenPayload,
  //   @Param() param: IdDTO,
  // ): Promise<EmployeeResponseDTO> {
  //   if (!user.isAdmin) {
  //     throw ResponseManager.buildError(
  //       ERROR_MESSAGES.USER_IS_NOT_ADMIN,
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }

  //   const employee = await this._employeeService.findOne({ id: +param.id });

  //   if (employee.photo) {
  //     employee.photo = FileHelpers.generatePath(employee.photo);
  //   }

  //   return employee;
  // }

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
