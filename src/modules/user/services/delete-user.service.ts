import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  IUserRepository,
  PrismaUser,
} from '../interfaces/repository.interface';
import { UserStatus } from '../interfaces/user-status.enum';
import { User } from '@prisma/client';
import { IUser } from '../interfaces/user.interface';
import { mapUserToReturn } from 'src/modules/utils/helpers/helpers-user-module';

@Injectable()
export class DeleteUserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  private formatUserToReturn(user: PrismaUser): IUser {
    return mapUserToReturn(user);
  }

  async execute(userId: string): Promise<IUser> {
    const user = await this.userRepository.deleteUser(
      userId,
      UserStatus.CANCELLED,
    );

    return this.formatUserToReturn(user);
  }
}
