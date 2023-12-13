import { UserStatus } from 'src/modules/user/interfaces/user-status.enum';
import { CredentialsDto } from '../dto/credentials.dto';
import { UserPayload } from './service.structure';
import { Channel } from '@prisma/client';

export interface IAuthRepository<User> {
  validateUser(credentialsDto: CredentialsDto): Promise<UserPayload | User>;
  validateChannel(id: string, origin: Channel): Promise<void>;
  confirmAccountEmail(
    confirmationToken: string,
    status: UserStatus,
    newChannel?: Channel,
  ): Promise<object>;
  sendRecoverPasswordEmail(email: string): Promise<string>;
  resetPassword(recoverToken: string, password: string): Promise<object>;
  resendAccountToken(id: string, email: string): Promise<ResendAccToken>;
}

export interface ResendAccToken {
  confirmationToken: string;
  originChannel: string;
}
