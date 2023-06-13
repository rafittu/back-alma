import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository, User } from '../structure/repository.structure';

@Injectable()
export class GetUserByIdService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  async execute(userId: string): Promise<User> {
    return await this.userRepository.getUserById(userId);
  }
}
