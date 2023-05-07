import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { LocalStrategy } from './infra/strategies/local.strategy';

@Module({
  controllers: [AuthController],
  providers: [PrismaService, AuthService, LocalStrategy],
})
export class AuthModule {}
