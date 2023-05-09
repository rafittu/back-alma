import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { LocalStrategy } from './infra/strategies/local.strategy';
import { SignInService } from './services/signin.service';
import { AuthRepository } from './repository/auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './infra/strategies/jwt.strategy';
import { LoginValidationMiddleware } from './infra/middlewares/login-validation.middleware';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    AuthRepository,
    SignInService,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('/auth/signin');
  }
}