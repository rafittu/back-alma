import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import * as swaggerUi from 'swagger-ui-express';
import * as SwaggerDoc from '../swagger.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGINS.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(helmet());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.contentSecurityPolicy());

  app.use('/v2/api-doc', swaggerUi.serve, swaggerUi.setup(SwaggerDoc));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableShutdownHooks();

  await app.listen(process.env.PORT);
}
bootstrap();
