import { Injectable } from '@nestjs/common';
import { UserPayload, UserToken } from '../structure/service.structure';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SignInService {
  constructor(private jwtService: JwtService) {}

  execute(user: UserPayload): UserToken {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const jwtToken = this.jwtService.sign(payload);

    return {
      accessToken: jwtToken,
    };
  }
}
