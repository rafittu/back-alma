import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { UserStatus } from '../../user/interfaces/user-status.enum';
import { AuthRepository } from '../repository/auth.repository';
import { IAuthRepository } from '../structure/auth-repository.structure';
import { RedisCacheService } from '../../../common/redis/redis-cache.service';
import { Channel } from '@prisma/client';

@Injectable()
export class ConfirmAccountEmailService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async execute(confirmationToken: string): Promise<object> {
    const userCacheChannel = (await this.redisCacheService.get(
      confirmationToken,
    )) as Channel;

    return await this.authRepository.confirmAccountEmail(
      confirmationToken,
      UserStatus.ACTIVE,
      userCacheChannel,
    );
  }
}
