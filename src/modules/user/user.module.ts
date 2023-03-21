import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [PrismaService, UserService],
})
export class UserModule {}
