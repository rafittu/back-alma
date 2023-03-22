import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository } from '../structure/repository.structure';
import { ICreateUser } from '../structure/service.structure';
import { UserStatus } from '../structure/user-status.enum';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
  ) {}

  async execute(data: ICreateUser): Promise<User> {
    if (data.password != data.passwordConfirmation) {
      throw new AppError(
        'user-service.createUser',
        422,
        'passwords do not match',
      );
    }

    const validateIp = (ip: string): boolean => {
      const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
      return ipRegex.test(ip);
    };

    if (!validateIp(data.ipAddress)) {
      throw new AppError('user-service.createUser', 511, 'invalid IP address');
    }

    return await this.userRepository.createUser(
      data,
      UserStatus.PENDING_CONFIRMATION,
    );
  }
}
