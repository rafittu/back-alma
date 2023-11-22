import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { UserStatus } from '../../user/interfaces/user-status.enum';
import { AuthRepository } from '../repository/auth.repository';
import { IAuthRepository } from '../structure/auth-repository.structure';

@Injectable()
export class ConfirmAccountEmailService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,
  ) {}

  async execute(confirmationToken: string): Promise<object> {
    return await this.authRepository.confirmAccountEmail(
      confirmationToken,
      UserStatus.ACTIVE,
    );
  }
}
