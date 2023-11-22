import { Inject, Injectable } from '@nestjs/common';
import { ipv4Regex, ipv6Regex } from '../../utils/helpers/helpers-user-module';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository } from '../interfaces/repository.interface';
import { UserStatus } from '../interfaces/user-status.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { ICreateUser, IUser } from '../interfaces/user.interface';
import { EmailService } from './email.service';
import { User } from '@prisma/client';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository<User>,
    private readonly emailService: EmailService,
  ) {}

  private validateIpAddress(ip: string): boolean {
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  async execute(data: CreateUserDto, ipAddress: string): Promise<IUser> {
    if (!this.validateIpAddress(ipAddress)) {
      throw new AppError('user-service.createUser', 403, 'invalid ip address');
    }

    if (data.password !== data.passwordConfirmation) {
      throw new AppError(
        'user-service.createUser',
        422,
        'passwords do not match',
      );
    }
    delete data.passwordConfirmation;

    try {
      const user = await this.userRepository.createUser({
        ...data,
        ipAddress,
        allowedChannels: data.originChannel,
        status: UserStatus.PENDING_CONFIRMATION,
      });

      await this.emailService.sendConfirmationEmail(
        data.email,
        user.confirmationToken,
      );

      return user;
    } catch (error) {
      throw new AppError(
        'user-service.createUser',
        500,
        'failed to create user',
      );
    }
  }
}
