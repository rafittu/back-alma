import { Channel } from '@prisma/client';
import { UserStatus } from './user-status.enum';

export interface ICreateUser {
  firstName: string;
  lastName: string;
  socialName?: string;
  bornDate: string;
  motherName: string;
  username?: string;
  email: string;
  phone: string;
  password: string;
  salt: string;
  confirmationToken: string;
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
    socialName?: string;
    bornDate: string;
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

export interface IRequestChannelAccess {
  id: string;
  ipAddress: string;
  confirmationToken: string;
}

export interface IUpdateUser {
  firstName?: string;
  lastName?: string;
  socialName?: string;
  bornDate?: string;
  motherName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  oldPassword?: string;
  newPassword?: string;
  passwordConfirmation?: string;
  ipAddress?: string;
  status?: UserStatus;
}

export interface IUserFilter {
  id?: string;
  email?: string;
  phone?: string;
}
