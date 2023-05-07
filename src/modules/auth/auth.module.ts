import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [PrismaService, AuthService],
})
export class AuthModule {}
