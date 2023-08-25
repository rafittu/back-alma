import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import * as swaggerUi from 'swagger-ui-express';
import * as SwaggerDoc from '../swagger.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(helmet());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.contentSecurityPolicy());

  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(SwaggerDoc));

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT);
}
bootstrap();
