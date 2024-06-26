import { UserStatus } from 'src/modules/user/interfaces/user-status.enum';
import { CredentialsDto } from '../dto/credentials.dto';
import { IResendAccToken, IUserPayload } from './service.interface';
import { Channel } from '@prisma/client';

export interface IUserByToken {
  userId: string;
  tokenExpiresAt: Date;
}

export interface IAuthRepository<User> {
  validateUser(credentialsDto: CredentialsDto): Promise<IUserPayload | User>;
  validateChannel(id: string, origin: Channel): Promise<void>;
  confirmAccountEmail(
    confirmationToken: string,
    status: UserStatus,
    ipAddress: string,
    newChannel?: Channel,
  ): Promise<object>;
  sendRecoverPasswordEmail(email: string): Promise<string>;
  resetPassword(
    recoverToken: string,
    password: string,
    ipAddress: string,
  ): Promise<object>;
  resendAccountToken(id: string, email: string): Promise<IResendAccToken>;
  findUserByToken(token: string): Promise<IUserByToken>;
  deleteSecurityToken(token: string): Promise<void>;
}
