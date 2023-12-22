import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import {
  IUserRepository,
  PrismaUser,
} from '../interfaces/repository.interface';
import { IUser, IUpdateSecurityData } from '../interfaces/user.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { EmailService } from '../../../common/services/email.service';
import { Channel, User } from '@prisma/client';
import { PasswordService } from '../../../common/services/password.service';
import {
  ipv4Regex,
  ipv6Regex,
  mapUserToReturn,
} from '../../../modules/utils/helpers/helpers-user-module';
import { UserStatus } from '../interfaces/user-status.enum';

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
  ) {}

  private validateIpAddress(ip: string): boolean {
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  private validatePassword(data: UpdateUserDto): void {
    if (!data.oldPassword || data.newPassword !== data.passwordConfirmation) {
      throw new AppError(
        'user-service.updateUser',
        422,
        !data.oldPassword
          ? `missing 'oldPassword' field`
          : 'new passwords do not match',
      );
    }
  }

  private formatUserToReturn(user: PrismaUser): IUser {
    return mapUserToReturn(user);
  }

  async execute(
    data: UpdateUserDto,
    userId: string,
    ipAddress: string,
  ): Promise<IUser> {
    if (!this.validateIpAddress(ipAddress)) {
      throw new AppError('user-service.updateUser', 403, 'invalid ip address');
    }

    let securityData: IUpdateSecurityData = {
      onUpdateIpAddress: ipAddress,
    };

    try {
      if (data.newPassword) {
        this.validatePassword(data);

        const { hashedPassword, salt } =
          await this.passwordService.hashPassword(data.newPassword);

        securityData = {
          ...securityData,
          hashedPassword,
          salt,
        };
      }

      if (data.email) {
        const { token, expiresAt } = this.passwordService.generateRandomToken();

        securityData = {
          ...securityData,
          confirmationToken: token,
          tokenExpiresAt: expiresAt,
          status: UserStatus.PENDING_CONFIRMATION,
        };
      }

      const user = await this.userRepository.updateUser(
        data,
        userId,
        securityData,
      );

      if (securityData.confirmationToken) {
        await this.emailService.sendConfirmationEmail(
          user.contact.email,
          securityData.confirmationToken,
          Channel.WOPHI,
        );
      }

      return this.formatUserToReturn(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'user-service.updateUser',
        500,
        'failed to update user data',
      );
    }
  }
}
