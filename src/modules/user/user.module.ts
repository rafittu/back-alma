import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserRepository } from './repository/user.repository';
import { CreateUserService } from './services/create-user.service';
import { GetUserByIdService } from './services/get-user-by-id.service';
import { UpdateUserService } from './services/update-user.service';
import { UserController } from './user.controller';
import { CancelUserService } from './services/cancel-user.service';
import { GetUserByFilterService } from './services/user-by-filter.service';
import { SecurityService } from '../../common/services/security.service';
import { EmailService } from '../../common/services/email.service';
import { RedisCacheService } from '../../common/redis/redis-cache.service';
import { ScheduledTaskService } from './services/scheduled-task.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    UserRepository,
    SecurityService,
    EmailService,
    RedisCacheService,
    CreateUserService,
    GetUserByIdService,
    UpdateUserService,
    CancelUserService,
    GetUserByFilterService,
    ScheduledTaskService,
    JwtService,
  ],
})
export class UserModule implements OnApplicationBootstrap {
  constructor(private readonly scheduledTaskService: ScheduledTaskService) {}

  onApplicationBootstrap() {
    this.scheduledTaskService.deleteCancelledUsersScheduledTask();
  }
}
