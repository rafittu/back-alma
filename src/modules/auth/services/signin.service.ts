import { Inject, Injectable } from '@nestjs/common';
import {
  JtwPayload,
  UserPayload,
  UserToken,
} from '../interfaces/service.interface';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from '../interfaces/auth-repository.interface';
import { Channel, User } from '@prisma/client';
import { AuthRepository } from '../repository/auth.repository';

@Injectable()
export class SignInService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,
    private jwtService: JwtService,
  ) {}

  async execute(user: UserPayload, origin: string): Promise<UserToken> {
    const signInChannel = origin.toUpperCase() as Channel;

    try {
      await this.authRepository.validateChannel(user.id, signInChannel);

      const payload: JtwPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
      };

      const jwtToken = this.jwtService.sign(payload);

      return {
        accessToken: jwtToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
