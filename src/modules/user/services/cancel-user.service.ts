import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  IUserRepository,
  PrismaUser,
} from '../interfaces/repository.interface';
import { UserStatus } from '../interfaces/user-status.enum';
import { User } from '@prisma/client';
import { IUser } from '../interfaces/user.interface';
import { mapUserToReturn } from '../../utils/helpers/helpers-user-module';

@Injectable()
export class CancelUserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  private formatUserToReturn(user: PrismaUser): IUser {
    return mapUserToReturn(user);
  }

  async execute(userId: string): Promise<IUser> {
    const user = await this.userRepository.cancelUser(
      userId,
      UserStatus.CANCELLED,
    );

    return this.formatUserToReturn(user);
  }
}
