import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserRepository } from './repository/user.repository';
import { CreateUserService } from './services/create-user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [PrismaService, UserRepository, CreateUserService],
})
export class UserModule {}
