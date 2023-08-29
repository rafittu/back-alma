import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { IAuthRepository } from '../structure/auth-repository.structure';

@Injectable()
export class ResendAccountTokenEmailService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,
  ) {}

  async execute(id: string, email: string) {
    return await this.authRepository.resendAccountToken(id, email);
  }
}
