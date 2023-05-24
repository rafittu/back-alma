import { Request } from 'express';

export class AuthRequest extends Request {
  user: UserPayload;
}

export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

export interface JtwPayload {
  sub: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface UserToken {
  accessToken: string;
}

export interface ResetPassword {
  password: string;
  passwordConfirmation: string;
}
