import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  IUserRepository,
  PrismaUser,
} from '../interfaces/repository.interface';
import { mapUserToReturn } from '../../../modules/utils/helpers/helpers-user-module';
import { User } from '@prisma/client';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class GetUserByIdService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  private formatUserToReturn(user: PrismaUser): IUser {
    return mapUserToReturn(user);
  }

  async execute(userId: string): Promise<IUser> {
    const user = await this.userRepository.getUserById(userId);

    return this.formatUserToReturn(user);
  }
}
