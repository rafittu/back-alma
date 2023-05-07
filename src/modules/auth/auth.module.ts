import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { LocalStrategy } from './infra/strategies/local.strategy';
import { SignInService } from './services/signin.service';
import { AuthRepository } from './repository/auth.repository';

@Module({
  controllers: [AuthController],
  providers: [PrismaService, LocalStrategy, AuthRepository, SignInService],
})
export class AuthModule {}
