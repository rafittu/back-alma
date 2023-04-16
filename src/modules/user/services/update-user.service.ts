import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository } from '../structure/repository.structure';
import { IUpdateUser } from '../structure/service.structure';
import { UserStatus } from '../structure/user-status.enum';

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  async execute(data: IUpdateUser, userId: string) {
    /* if updating email or phone, remember to send an
    email/code confirmation */
    if (data.email || data.phone) {
      data.status = UserStatus.PENDING_CONFIRMATION;
    }

    if (data.password && data.password != data.passwordConfirmation) {
      throw new AppError(
        'user-service.updateUser',
        422,
        'passwords do not match',
      );
    }

    return await this.userRepository.updateUser(data, userId);
  }
}
