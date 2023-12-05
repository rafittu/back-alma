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

export interface IUserFilter {
  id?: string;
  email?: string;
  phone?: string;
}

export interface ISecurityData {
  password?: string;
  salt?: string;
  confirmationToken?: string;
  status?: UserStatus;
  onUpdateIpAddress: string;
}
