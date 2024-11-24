import { AuthUserGuard } from '@common/guards';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { ITokenPayload } from '@common/models';
import { AuthUser } from '@common/decorators';
import { DepartmentResponseDTO, IdDTO, SuccessDTO } from '@common/dtos';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { CreateDepartmentDTO, UpdateDepartmentDTO } from './dto';

@Controller('department')
@UseGuards(AuthUserGuard())
@ApiTags('department')
@ApiBearerAuth()
export class DepartmentController {
  constructor(private readonly _departmentService: DepartmentService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get department by id' })
  async findOneById(
    @AuthUser() user: ITokenPayload,
    @Param() param: IdDTO,
  ): Promise<DepartmentResponseDTO> {
    if (!user.isAdmin) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.USER_IS_NOT_ADMIN,
        HttpStatus.FORBIDDEN,
      );
    }

    const department = await this._departmentService.findOne({ id: +param.id });

    return department;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department by id' })
  @ApiBody({
    description: 'Update department',
    type: UpdateDepartmentDTO,
  })
  @ApiResponse({ status: 201, type: SuccessDTO })
  async update(
    @AuthUser() user: ITokenPayload,
    @Param() param: IdDTO,
    @Body() body: UpdateDepartmentDTO,
  ): Promise<SuccessDTO> {
    if (!user.isAdmin) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.USER_IS_NOT_ADMIN,
        HttpStatus.FORBIDDEN,
      );
    }

    const department = await this.findOneById(user, param);

    await this._departmentService.update(department, body);

    return { success: true };
  }

  // Для удобства проверки оставил этот метод
  @Post()
  @ApiOperation({
    summary: 'Create department.  Для удобства проверки оставил этот метод',
  })
  @ApiResponse({ status: 201, type: SuccessDTO })
  async create(
    @AuthUser() user: ITokenPayload,
    @Body() body: CreateDepartmentDTO,
  ): Promise<SuccessDTO> {
    if (!user.isAdmin) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.USER_IS_NOT_ADMIN,
        HttpStatus.FORBIDDEN,
      );
    }

    await this._departmentService.create(body);

    return { success: true };
  }
}
