import { UserStatus } from './user-status.enum';

export interface ICreateUser {
  firstName: string;
  lastName: string;
  socialName?: string;
  bornDate: string;
  motherName: string;
  username?: string;
  email: string;
  phone?: string;
  password: string;
  passwordConfirmation: string;
  ipAddress: string;
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
