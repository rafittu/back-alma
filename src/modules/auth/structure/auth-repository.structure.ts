import { UserStatus } from 'src/modules/user/interfaces/user-status.enum';
import { CredentialsDto } from '../dto/credentials.dto';
import { UserPayload } from './service.structure';

export interface IAuthRepository<User> {
  validateUser(credentialsDto: CredentialsDto): Promise<UserPayload | User>;
  confirmAccountEmail(
    confirmationToken: string,
    status: UserStatus,
  ): Promise<object>;
  sendRecoverPasswordEmail(email: string): Promise<string>;
  resetPassword(recoverToken: string, password: string): Promise<object>;
  resendAccountToken(id: string, email: string): Promise<ResendAccToken>;
}

export interface ResendAccToken {
  confirmationToken: string;
}
