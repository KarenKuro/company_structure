import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { UserEntity } from '@common/database';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IAuthTokens, ICreateUser, IJwt, ITokenPayload } from '@common/models';

@Injectable()
export class AuthService {
  private readonly jwtSecrets: IJwt =
    this._configService.get<IJwt>('JWT_CONFIG');

  constructor(
    @InjectRepository(UserEntity)
    private _adminRepository: Repository<UserEntity>,

    private _configService: ConfigService,

    private _jwtService: JwtService,
  ) {}

  async create(body: ICreateUser): Promise<IAuthTokens> {
    const { name, isAdmin } = body;

    const user = await this._adminRepository.findOne({
      where: { name },
    });

    if (user) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.USER_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdUser = (await this._adminRepository.save({
      name,
      isAdmin,
    })) as UserEntity;

    const payload = { id: createdUser.id, isAdmin: createdUser.isAdmin };
    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(
      createdUser.id,
      createdUser.isAdmin,
    );

    return { accessToken, refreshToken };
  }

  async createAccessToken(payload: ITokenPayload): Promise<string> {
    return this._jwtService.sign(payload);
  }

  async createRefreshToken(id: number, isAdmin: boolean): Promise<string> {
    const refreshToken = uuid();

    return this._jwtService.sign(
      { id, isAdmin, jti: refreshToken },
      {
        secret: this.jwtSecrets.refreshSecret,
        expiresIn: this.jwtSecrets.refreshExpiresIn,
      },
    );
  }

  async refreshAccessToken(
    id: number,
    isAdmin: boolean,
    refreshToken: string,
  ): Promise<IAuthTokens> {
    refreshToken = refreshToken?.replace('Bearer', '')?.trim();

    const accessToken = await this.createAccessToken({ id, isAdmin });

    return { accessToken, refreshToken };
  }
}
