import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { LocalStrategy } from './infra/strategies/local.strategy';
import { SignInService } from './services/signin.service';
import { AuthRepository } from './repository/auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './infra/strategies/jwt.strategy';
import { LoginValidationMiddleware } from './infra/middlewares/login-validation.middleware';
import { ConfirmAccountEmailService } from './services/confirm-email.service';
import { RecoverPasswordService } from './services/recover-password.service';
import { ResendAccountTokenEmailService } from './services/resend-account-token.service';
import { UserRepository } from '../user/repository/user.repository';
import { RedisCacheService } from '../../common/redis/redis-cache.service';
import { EmailService } from '../../common/services/email.service';
import { SecurityService } from '../../common/services/security.service';
import { RefreshJwtStrategy } from './infra/strategies/refresh-jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    SecurityService,
    AuthRepository,
    UserRepository,
    RedisCacheService,
    EmailService,
    SignInService,
    ConfirmAccountEmailService,
    RecoverPasswordService,
    ResendAccountTokenEmailService,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('/auth/signin');
  }
}
