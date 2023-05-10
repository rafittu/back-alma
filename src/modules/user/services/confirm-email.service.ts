import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../structure/repository.structure';
import { UserStatus } from '../structure/user-status.enum';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class ConfirmAccountService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  async execute(confirmationToken: string): Promise<object> {
    return await this.userRepository.confirmAccount(
      confirmationToken,
      UserStatus.ACTIVE,
    );
  }
}
