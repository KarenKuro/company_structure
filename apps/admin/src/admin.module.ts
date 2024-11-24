import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  ADMIN_VALIDATIONS,
  appConfig,
  databaseConfiguration,
  DepatrmentEntity,
  EmployeeEntity,
  ENV_CONST,
  jwtConfig,
  NodeEnv,
  UserEntity,
} from '@common/index';

import { join } from 'path';

import { EmployeeModule } from '@admin-resources/employee';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from './resources/auth/auth.module';
import { DepartmentModule } from '@admin-resources/department';

const isProductionMode = process.env.NODE_ENV === NodeEnv.production;

const envFilePath = isProductionMode
  ? ENV_CONST.ENV_PATH_PROD
  : ENV_CONST.ENV_PATH_DEV;

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'uploads'), // Путь к папке uploads
      serveRoot: '/uploads', // URL-адрес, по которому файлы будут доступны
    }),
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      expandVariables: true,
      validationSchema: ADMIN_VALIDATIONS,
      load: [databaseConfiguration, jwtConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, AuthModule, EmployeeModule, DepartmentModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>(`DB_CONFIG.host`),
          port: configService.get<number>(`DB_CONFIG.port`),
          username: configService.get<string>(`DB_CONFIG.username`),
          password: configService.get<string>(`DB_CONFIG.password`),
          database: configService.get<string>(`DB_CONFIG.database`),
          autoLoadEntities: true,
          // Do not use synchronize in production mode
          // https://docs.nestjs.com/techniques/database
          synchronize: configService.get<boolean>(`DB_CONFIG.sync`),
          entities: [UserEntity, EmployeeEntity, DepatrmentEntity],
        };
      },
    }),
    AuthModule,
    EmployeeModule,
    DepartmentModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
