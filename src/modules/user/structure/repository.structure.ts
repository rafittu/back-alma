import { ICreateUser, IUpdateUser } from './service.structure';
import { UserStatus } from './user-status.enum';

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

export interface UnformattedUser {
  id: string;
  user_personal_info_id?: string;
  user_contact_info_id?: string;
  user_security_info_id?: string;
  status?: string;
  personal?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    social_name?: string;
    born_date?: string;
    mother_name?: string;
    updated_at?: Date;
  };
  contact?: {
    id?: string;
    username?: string;
    email?: string;
    phone?: string;
    updated_at?: Date;
  };
  security?: {
    id?: string;
    confirmation_token?: string;
    updated_at?: Date;
  };
  created_at: Date;
  updated_at: Date;
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
    updatedAt?: Date;
  };
  contact: {
    id: string;
    username: string;
    email: string;
    phone?: string;
    updatedAt?: Date;
  };
  security: {
    id: string;
    confirmationToken?: string;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository<User> {
  createUser(data: ICreateUser, status: UserStatus): Promise<User>;
  getUserById(userId: string): Promise<User>;
  updateUser(data: IUpdateUser, userId: string): Promise<User>;
  deleteUser(userId: string, status: UserStatus): Promise<User>;
  confirmAccount(
    confirmationToken: string,
    status: UserStatus,
  ): Promise<object>;
}
