import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthRepository } from '../../repository/auth.repository';
import { CredentialsDto } from '../../dto/credentials.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authRepository: AuthRepository) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const credentials: CredentialsDto = {
      email,
      password,
    };
    return await this.authRepository.validateUser(credentials);
  }
}
