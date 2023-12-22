import { Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { IAuthRepository } from '../interfaces/auth-repository.interface';
import { Channel, User } from '@prisma/client';
import { IResetPassword } from '../interfaces/service.interface';
import { AppError } from '../../../common/errors/Error';
import { EmailService } from '../../../common/services/email.service';
import { SecurityService } from '../../../common/services/security.service';
import {
  ipv4Regex,
  ipv6Regex,
} from '../../../modules/utils/helpers/helpers-user-module';

@Injectable()
export class RecoverPasswordService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,
    private readonly emailService: EmailService,
    private readonly securityService: SecurityService,
  ) {}

  private validateIpAddress(ip: string): boolean {
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  async sendRecoverPasswordEmail(email: string): Promise<object> {
    const recoverToken =
      await this.authRepository.sendRecoverPasswordEmail(email);

    await this.emailService.sendConfirmationEmail(
      email,
      recoverToken,
      Channel.WOPHI,
    );

    return {
      message: `recover password email sent to ${email}`,
    };
  }

  async resetPassword(
    recoverToken: string,
    resetPasswordData: IResetPassword,
    ipAddress: string,
  ): Promise<object> {
    const { password, passwordConfirmation } = resetPasswordData;

    if (!this.validateIpAddress(ipAddress)) {
      throw new AppError('user-service.createUser', 403, 'invalid ip address');
    }

    if (password !== passwordConfirmation) {
      throw new AppError(
        'recover-password-service.resetPassword',
        400,
        'passwords do not match',
      );
    }

    try {
      const tokenExpiresAt =
        await this.authRepository.findUserByToken(recoverToken);

      if (!this.securityService.isTokenValid(tokenExpiresAt)) {
        throw new AppError(
          'auth-service.resetPassword',
          400,
          'invalid or expired token',
        );
      }

      return await this.authRepository.resetPassword(
        recoverToken,
        password,
        ipAddress,
      );
    } catch (error) {
      throw error;
    }
  }
}
