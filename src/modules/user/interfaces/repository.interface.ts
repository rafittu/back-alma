import { ICreateUser, IUpdateUser, IUserFilter } from './user.interface';
import { UserStatus } from './user-status.enum';
import { Channel } from '@prisma/client';

export interface UserPersonalInfo {
  first_name: string;
  last_name: string;
  social_name?: string;
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
  ip_address_origin: string;
  on_update_ip_address?: string;
  status: UserStatus;
  updated_at?: string;
}

export interface PrismaUser {
  id: string;
  personal: {
    id: string;
    first_name: string;
    last_name: string;
    social_name?: string;
    born_date: string;
    mother_name: string;
    updated_at: Date;
  };
  contact: {
    id: string;
    username?: string;
    email: string;
    phone: string;
    updated_at: Date;
  };
  security: {
    id: string;
    status: string;
    updated_at: Date;
  };
  allowed_channels: Channel[];
  created_at: Date;
  updated_at: Date;
}

export interface UnformattedUser {
  id: string;
  user_personal_info_id?: string;
  user_contact_info_id?: string;
  user_security_info_id?: string;
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
    status?: string;
    updated_at?: Date;
  };
  created_at: Date;
  updated_at: Date;
}

export interface TemporaryUser {
  id: string;
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
    status: string;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository<User> {
  createUser(data: ICreateUser): Promise<User>;
  userByFilter(filter: IUserFilter): Promise<PrismaUser | null>;
  getUserById(userId: string): Promise<User>;
  updateUser(data: IUpdateUser, userId: string): Promise<User>;
  deleteUser(userId: string, status: UserStatus): Promise<User>;
}
