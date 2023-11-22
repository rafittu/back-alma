import { UserStatus } from './user-status.enum';

export interface IUser {
  id: string;
  personal: {
    id: string;
    firstName: string;
    lastName: string;
    socialName?: string;
    bornDate: string;
    motherName: string;
  };
  contact: {
    id: string;
    username?: string;
    email: string;
    phone: string;
  };
  security: {
    id: string;
    status: string;
  };
  allowedChannels: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
  ipAddress: string;
  originChannel: string;
  allowedChannels: string;
  status: string;
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
