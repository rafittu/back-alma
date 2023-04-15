import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository } from '../structure/repository.structure';

@Injectable()
export class GetUserByIdService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  async execute(data: string): Promise<User> {
    return await this.userRepository.getUserById(data);
  }
}
