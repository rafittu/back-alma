import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { UserStatus } from '../../user/interfaces/user-status.enum';
import { AuthRepository } from '../repository/auth.repository';
import { IAuthRepository } from '../interfaces/auth-repository.interface';
import { RedisCacheService } from '../../../common/redis/redis-cache.service';
import { Channel } from '@prisma/client';
import { SecurityService } from '../../../common/services/security.service';
import { AppError } from '../../../common/errors/Error';
import {
  ipv4Regex,
  ipv6Regex,
} from '../../../modules/utils/helpers/helpers-user-module';

@Injectable()
export class ConfirmAccountEmailService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,
    private readonly redisCacheService: RedisCacheService,
    private readonly securityService: SecurityService,
  ) {}

  private validateIpAddress(ip: string): boolean {
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  async execute(confirmationToken: string, ipAddress: string): Promise<object> {
    if (!this.validateIpAddress(ipAddress)) {
      throw new AppError(
        'auth-service.confirmEmail',
        403,
        'invalid ip address',
      );
    }

    try {
      const userCacheChannel = (await this.redisCacheService.get(
        confirmationToken,
      )) as Channel;

      const tokenExpiresAt =
        await this.authRepository.findUserByToken(confirmationToken);

      if (!this.securityService.isTokenValid(tokenExpiresAt)) {
        throw new AppError(
          'auth-service.confirmEmail',
          400,
          'invalid or expired token',
        );
      }

      return await this.authRepository.confirmAccountEmail(
        confirmationToken,
        UserStatus.ACTIVE,
        ipAddress,
        userCacheChannel,
      );
    } catch (error) {
      throw error;
    }
  }
}
