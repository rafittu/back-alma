import { Inject, Injectable } from '@nestjs/common';
import { ipv4Regex, ipv6Regex } from '../../utils/helpers/helpers-user-module';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository, User } from '../structure/repository.structure';
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
      return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    };

    if (!validateIp(data.ipAddress)) {
      throw new AppError(
        'user-service.createUser',
        403,
        'cannot create user from a local server',
      );
    }

    return await this.userRepository.createUser(
      data,
      UserStatus.PENDING_CONFIRMATION,
    );
  }
}
