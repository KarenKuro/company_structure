import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthUserGuard } from '@common/guards';
import { EmployeeResponseDTO, IdDTO } from '@common/dtos';
import { AuthUser } from '@common/decorators';
import { ITokenPayload } from '@common/models';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

import { EmployeeService } from './employee.service';

@Controller('employee')
@UseGuards(AuthUserGuard())
@ApiTags('Employee')
@ApiBearerAuth()
export class EmployeeController {
  constructor(private readonly _employeeService: EmployeeService) {}

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

    if (!employee) {
      throw (
        (ResponseManager.buildError(ERROR_MESSAGES.EMPLOYEE_NOT_EXISTS),
        HttpStatus.BAD_REQUEST)
      );
    }

    return employee;
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
