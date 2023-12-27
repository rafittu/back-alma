import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import * as swaggerUi from 'swagger-ui-express';
import * as SwaggerDoc from '../swagger.json';
import * as AWS from 'aws-sdk';

async function bootstrap() {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(helmet());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.contentSecurityPolicy());

  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(SwaggerDoc));

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
