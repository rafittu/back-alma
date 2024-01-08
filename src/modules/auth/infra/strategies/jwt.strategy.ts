import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJtwPayload, IUserPayload } from '../../interfaces/service.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: IJtwPayload): Promise<IUserPayload> {
    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      status: payload.status,
    };
  }
}
