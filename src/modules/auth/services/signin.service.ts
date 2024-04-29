import { Inject, Injectable } from '@nestjs/common';
import {
  IJtwPayload,
  IUserPayload,
  IUserToken,
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

  async execute(user: IUserPayload, origin: string): Promise<IUserToken> {
    const signInChannel = origin.toUpperCase() as Channel;

    try {
      await this.authRepository.validateChannel(user.id, signInChannel);

      const payload: IJtwPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
