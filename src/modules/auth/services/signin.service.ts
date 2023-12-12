import { Injectable } from '@nestjs/common';
import {
  JtwPayload,
  UserPayload,
  UserToken,
} from '../structure/service.structure';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from '../structure/auth-repository.structure';
import { Channel, User } from '@prisma/client';

@Injectable()
export class SignInService {
  constructor(
    private jwtService: JwtService,
    private authRepository: IAuthRepository<User>,
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
