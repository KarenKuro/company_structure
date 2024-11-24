import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { IValidationErrors } from '@common/models';
import { ResponseManager } from '@common/helpers';

import { AdminModule } from './admin.module';

const PORT = process.env.PORT;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AdminModule);

  app.enableCors();
  app.disable('x-powered-by');

  // automatically serialize data. Use class-transformer library
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // automatically validate incoming request data using decorators and the class-validator library
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorResponse: IValidationErrors[] = [];
        errors.forEach((e) => {
          if (e.constraints) {
            errorResponse.push(...ResponseManager.validationHandler([e]));
          }
          if (e.children) {
            errorResponse.push(
              ...ResponseManager.validationHandler(
                e.children,
                e.property?.toLowerCase(),
              ),
            );
          }
        });
        throw ResponseManager.buildError(
          { errors: errorResponse, message: 'ValidationError' },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      },
    }),
  );

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Company structure Admin APIs')
      .setDescription('The Company structure Admin API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(PORT, () => {
    console.log(`ADMIN: ${PORT}`);
  });
}
bootstrap();
