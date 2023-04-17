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

export interface IUserPersonalInfo {
  firstName: string;
  lastName: string;
  socialName: string;
  bornDate: string;
  motherName: string;
  updatedAt: Date;
}

export interface IUserContactInfo {
  username: string;
  email: string;
  phone: string;
  updatedAt: Date;
}

export interface PartialUser {
  id: string;
  userPersonalInfoId: string;
  userContactInfoId: string;
  userSecurityInfoId: string;
  personal: IUserPersonalInfo;
  contact: IUserContactInfo;
  status: string;
  createdAt: Date;
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
  oldPassword?: string;
  password?: string;
  passwordConfirmation?: string;
  status?: UserStatus;
}
