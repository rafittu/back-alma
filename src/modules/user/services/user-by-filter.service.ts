import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  IUserRepository,
  PrismaUser,
} from '../interfaces/repository.interface';
import { IUser, IUserFilter } from '../interfaces/user.interface';
import { User } from '@prisma/client';
import { mapUserToReturn } from '../../../modules/utils/helpers/helpers-user-module';

@Injectable()
export class GetUserByFilterService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  private formatUserToReturn(user: PrismaUser): IUser {
    return mapUserToReturn(user);
  }

  async execute(filter: IUserFilter): Promise<IUser | null> {
    const user = await this.userRepository.userByFilter(filter);

    return this.formatUserToReturn(user);
  }
}
