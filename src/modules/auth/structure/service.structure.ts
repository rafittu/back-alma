import { Request } from 'express';

export class AuthRequest extends Request {
  user: UserPayload;
}

export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

export interface UserToken {
  accessToken: string;
}
