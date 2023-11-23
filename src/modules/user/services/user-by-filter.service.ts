import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  IUserRepository,
  TemporaryUser as User,
} from '../interfaces/repository.interface';
import { IUserFilter } from '../interfaces/user.interface';

@Injectable()
export class GetUserByFilterService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  async execute(filter: IUserFilter): Promise<User | null> {
    return await this.userRepository.userByFilter(filter);
  }
}
