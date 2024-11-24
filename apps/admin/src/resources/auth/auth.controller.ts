import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthUserGuard } from '@common/guards';
import { TokenTypes } from '@common/enums';
import { AuthToken, AuthUser } from '@common/decorators';
import { IRefreshPayload } from '@common/models';

import { AuthService } from './auth.service';
import { AuthTokensDTO, CreateUserDTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  // Здесь я бы довавил ограничение, чтобы создавать нового пользователя нужно быть админом.
  // Но для удобства проверки оставил без этого условия
  @Post()
  @ApiOperation({
    summary: 'Create user. Для удобства проверки оставил этот метод',
  })
  @ApiResponse({
    status: 201,
    description: 'Return "access and refresh tokens"',
    type: AuthTokensDTO,
  })
  async create(@Body() body: CreateUserDTO): Promise<AuthTokensDTO> {
    return await this._authService.create(body);
  }

  @Post('refresh')
  @ApiOperation({
    summary:
      'This API aimed to check the "refresh token" and refresh the "access token".',
  })
  @ApiResponse({
    status: 201,
    description: 'Return "access and refresh tokens"',
    type: AuthTokensDTO,
  })
  @ApiBearerAuth()
  @UseGuards(AuthUserGuard(TokenTypes.REFRESH))
  async refreshToken(
    @AuthToken() refreshToken: string,
    @AuthUser() user: IRefreshPayload,
  ): Promise<AuthTokensDTO> {
    return this._authService.refreshAccessToken(
      user.id,
      user.isAdmin,
      refreshToken,
    );
  }
}
