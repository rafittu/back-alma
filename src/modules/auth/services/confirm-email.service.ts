import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { UserStatus } from '../../user/interfaces/user-status.enum';
import { AuthRepository } from '../repository/auth.repository';
import { IAuthRepository } from '../interfaces/auth-repository.interface';
import { RedisCacheService } from '../../../common/redis/redis-cache.service';
import { Channel } from '@prisma/client';
import { PasswordService } from '../../../common/services/password.service';
import { AppError } from '../../../common/errors/Error';

@Injectable()
export class ConfirmAccountEmailService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,
    private readonly redisCacheService: RedisCacheService,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(confirmationToken: string): Promise<object> {
    try {
      const userCacheChannel = (await this.redisCacheService.get(
        confirmationToken,
      )) as Channel;

      const tokenExpiresAt =
        await this.authRepository.findUserByToken(confirmationToken);

      if (!this.passwordService.isTokenValid(tokenExpiresAt)) {
        throw new AppError(
          'auth-service.confirmEmail',
          400,
          'invalid or expired token',
        );
      }

      return await this.authRepository.confirmAccountEmail(
        confirmationToken,
        UserStatus.ACTIVE,
        userCacheChannel,
      );
    } catch (error) {
      throw error;
    }
  }
}
