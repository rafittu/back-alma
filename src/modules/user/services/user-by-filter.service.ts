import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository } from '../interfaces/repository.interface';
import { IUser, IUserFilter } from '../interfaces/user.interface';
import { User } from '@prisma/client';

@Injectable()
export class GetUserByFilterService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  async execute(filter: IUserFilter): Promise<IUser> {
    return await this.userRepository.userByFilter(filter);
  }
}
