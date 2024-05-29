import { Channel } from '@prisma/client';
import { UserStatus } from './user-status.enum';

export interface ICreateUser {
  firstName: string;
  lastName: string;
  cpf: string;
  socialName?: string;
  bornDate: Date;
  motherName: string;
  username?: string;
  email: string;
  phone: string;
  hashedPassword: string;
  salt: string;
  confirmationToken: string;
  tokenExpiresAt: Date;
  ipAddressOrigin: string;
  originChannel: Channel;
  allowedChannels: Channel[];
  status: UserStatus;
}

export interface IUser {
  id: string;
  personal: {
    id: string;
    firstName: string;
    lastName: string;
    cpf?: string;
    socialName?: string;
    bornDate: Date;
    motherName: string;
    updatedAt?: Date;
  };
  contact: {
    id: string;
    username?: string;
    email: string;
    phone: string;
    updatedAt?: Date;
  };
  security: {
    id: string;
    status: string;
    updatedAt?: Date;
  };
  allowedChannels: Channel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateUser extends IUser {
  accessToken: string;
  refreshToken: string;
}

export interface IRequestChannelAccess {
  id: string;
  ipAddress: string;
  confirmationToken: string;
  tokenExpiresAt: Date;
}

export interface IUserFilter {
  id?: string;
  email?: string;
  phone?: string;
}

export interface IUpdateSecurityData {
  hashedPassword?: string;
  salt?: string;
  confirmationToken?: string;
  tokenExpiresAt?: Date;
  status?: UserStatus;
  onUpdateIpAddress: string;
}

export interface IReactivateUserAccount {
  email: string;
  originChannel: Channel;
  confirmationToken?: string;
}

export interface IDefaultMessage {
  message: string;
}
