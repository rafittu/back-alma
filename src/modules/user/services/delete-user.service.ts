import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository } from '../interfaces/repository.interface';
import { UserStatus } from '../interfaces/user-status.enum';
import { User } from '@prisma/client';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class DeleteUserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  async execute(userId: string): Promise<IUser> {
    return await this.userRepository.deleteUser(userId, UserStatus.CANCELLED);
  }
}
