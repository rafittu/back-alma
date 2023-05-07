import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository, User } from '../structure/repository.structure';
import { UserStatus } from '../structure/user-status.enum';

@Injectable()
export class DeleteUserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  async execute(userId: string): Promise<User> {
    return await this.userRepository.deleteUser(userId, UserStatus.CANCELLED);
  }
}
