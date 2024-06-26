import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import * as Joi from 'joi';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/infra/guards/jwt-auth.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from './modules/utils/configs/mailer.config';
import { Cron, ScheduleModule } from '@nestjs/schedule';
import { SQSWorkerService } from './common/services/sqs-worker.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        CORS_ORIGINS: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_HOST_CONTAINER: Joi.string().required(),
        REDIS_HOST_CONTAINER: Joi.string().required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_CONFIG_HOST: Joi.string().required(),
        REDIS_CONFIG_PORT: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        REFRESH_JWT_SECRET: Joi.string().required(),
        REFRESH_JWT_EXPIRATION_TIME: Joi.string().required(),
        MAILER_EMAIL: Joi.string().required(),
        MAILER_PASSWORD: Joi.string().required(),
        MAILER_DOMAIN: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        SQS_QUEUE_URL: Joi.string().required(),
        SQS_DLQ_QUEUE_URL: Joi.string().required(),
      }),
    }),
    MailerModule.forRoot(mailerConfig),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    SQSWorkerService,
  ],
})
export class AppModule {
  constructor(private readonly sqsWorkerService: SQSWorkerService) {}

  @Cron('*/1 * * * *')
  async handleCron() {
    const queueUrl = process.env.SQS_QUEUE_URL;
    await this.sqsWorkerService.pollMessagesFromSQS(queueUrl);
  }
}
