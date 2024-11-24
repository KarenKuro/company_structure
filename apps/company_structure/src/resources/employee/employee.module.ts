import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileService } from '@shared/file';

import { DepatrmentEntity, EmployeeEntity } from '@common/database';

import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

import { DepartmentService } from '@company_structure-resources/department';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeEntity, DepatrmentEntity]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(`JWT_CONFIG.secret`),
        signOptions: {
          expiresIn: configService.get<string>(`JWT_CONFIG.expiresIn`),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, FileService, DepartmentService],
})
export class EmployeeModule {}
