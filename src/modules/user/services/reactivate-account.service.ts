import { Inject, Injectable } from '@nestjs/common';
import { ipv4Regex, ipv6Regex } from '../../utils/helpers/helpers-user-module';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository } from '../interfaces/repository.interface';
import { UserStatus } from '../interfaces/user-status.enum';
import {
  IDefaultMessage,
  IReactivateUserAccount,
} from '../interfaces/user.interface';
import { SecurityService } from '../../../common/services/security.service';
import { EmailService } from '../../../common/services/email.service';
import { Channel, User } from '@prisma/client';
import { AuthRepository } from '../../../modules/auth/repository/auth.repository';

@Injectable()
export class ReactivateAccountService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository<User>,
    private authRepository: AuthRepository,
    private readonly securityService: SecurityService,
    private readonly emailService: EmailService,
  ) {}

  private validateIpAddress(ip: string): boolean {
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  private async confirmReactivateAccount(
    confirmationToken: string,
    ipAddress: string,
  ): Promise<IDefaultMessage> {
    try {
      const { userId, tokenExpiresAt } =
        await this.authRepository.findUserByToken(confirmationToken);

      const isTokenValid = this.securityService.isTokenValid(tokenExpiresAt);

      if (!isTokenValid) {
        throw new AppError(
          'user-service.reactivateAccount',
          400,
          'invalid or expired token',
        );
      }

      const activeStatus = { status: UserStatus.ACTIVE };
      const securityData = { onUpdateIpAddress: ipAddress };

      await this.userRepository.updateUser(activeStatus, userId, securityData);
      await this.authRepository.deleteSecurityToken(confirmationToken);

      return {
        message: 'Account successfully reactivated.',
      };
    } catch (error) {
      throw error;
    }
  }

  async execute(
    data: IReactivateUserAccount,
    ipAddress: string,
    confirmationToken?: string,
  ): Promise<IDefaultMessage> {
    if (!this.validateIpAddress(ipAddress)) {
      throw new AppError(
        'user-service.reactivateAccount',
        403,
        'invalid ip address',
      );
    }

    if (confirmationToken) {
      return await this.confirmReactivateAccount(confirmationToken, ipAddress);
    }

    try {
      const user = await this.userRepository.userByFilter({
        email: data.email,
      });
      const userOriginChannel = data.originChannel.toUpperCase() as Channel;

      if (
        !user ||
        !user.allowed_channels.includes(userOriginChannel) ||
        user.security.status !== UserStatus.CANCELLED
      ) {
        throw new AppError(
          'user-service.reactivateAccount',
          400,
          'account not eligeble to be reactivated',
        );
      }

      const { token, expiresAt } = this.securityService.generateRandomToken();

      await this.userRepository.reactivateAccount({
        id: user.id,
        ipAddress,
        confirmationToken: token,
        tokenExpiresAt: expiresAt,
      });

      await this.emailService.sendReactivateAccountEmail(
        data.email,
        token,
        data.originChannel,
      );

      return {
        message: `Confirmation token sent to ${data.email}. Token expires at ${expiresAt}`,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'user-service.reactivateAccount',
        500,
        'failed to reactivate user account',
      );
    }
  }
}
