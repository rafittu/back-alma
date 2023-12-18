import { UserStatus } from '@prisma/client';
import { Request } from 'express';

export class IAuthRequest extends Request {
  user: IUserPayload;
  body: {
    origin: string;
  } & ReadableStream<Uint8Array>;
}

export interface IUserPayload {
  id: string;
  username: string;
  email: string;
  status: UserStatus;
}

export interface IJtwPayload {
  sub: string;
  username: string;
  email: string;
  status: UserStatus;
  iat?: number;
  exp?: number;
}

export interface IResendAccToken {
  confirmationToken: string;
  originChannel: string;
}

export interface IUserToken {
  accessToken: string;
}

export interface IResetPassword {
  password: string;
  passwordConfirmation: string;
}
