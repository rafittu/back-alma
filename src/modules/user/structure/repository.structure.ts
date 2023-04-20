import { ICreateUser, IUpdateUser } from './service.structure';
import { UserStatus } from './user-status.enum';

export interface UnformattedUser {
  firstName?: string;
  lastName?: string;
  socialName?: string;
  bornDate?: string;
  motherName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  ipAddress?: string;
}

export interface UserPersonalInfo {
  first_name: string;
  last_name: string;
  social_name: string;
  born_date: string;
  mother_name: string;
  updated_at?: string;
}

export interface UserContactInfo {
  username: string;
  email: string;
  phone: string;
  updated_at?: string;
}

export interface UserSecurityInfo {
  password: string;
  salt: string;
  confirmation_token: string;
  recover_token: string;
  ip_address: number;
  updated_at?: string;
}

export interface User {
  id: string;
  status: string;
  personal: {
    id: string;
    firstName: string;
    lastName?: string;
    socialName: string;
    bornDate?: string;
    motherName?: string;
    updatedAt?: string;
  };
  contact: {
    id: string;
    username: string;
    email: string;
    phone?: string;
    updatedAt?: string;
  };
  security: {
    id: string;
    confirmationToken?: string;
    updatedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IUserRepository<User> {
  createUser(data: ICreateUser, status: UserStatus): Promise<User>;
  getUserById(userId: string): Promise<User>;
  updateUser(data: IUpdateUser, userId: string): Promise<User>;
}
