import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserRepository } from './repository/user.repository';
import { CreateUserService } from './services/create-user.service';
import { GetUserByIdService } from './services/get-user-by-id.service';
import { UpdateUserService } from './services/update-user.service';
import { UserController } from './user.controller';
import { DeleteUserService } from './services/delete-user.service';
import { GetUserByFilterService } from './services/user-by-filter.service';
import { PasswordService } from './services/password.service';
import { EmailService } from './services/email.service';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    UserRepository,
    PasswordService,
    EmailService,
    CreateUserService,
    GetUserByIdService,
    UpdateUserService,
    DeleteUserService,
    GetUserByFilterService,
  ],
})
export class UserModule {}
