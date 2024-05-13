import {
  ICreateUser,
  IRequestChannelAccess,
  IUserFilter,
  IUpdateSecurityData,
} from './user.interface';
import { UserStatus } from './user-status.enum';
import { Channel } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';

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
  token_expires_at: Date;
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

export interface reactivateData {
  id: string;
  ipAddress: string;
  confirmationToken: string;
  tokenExpiresAt: Date;
}

export interface IUserRepository<User> {
  createUser(data: ICreateUser): Promise<User>;
  createAccessToAdditionalChannel(data: IRequestChannelAccess): Promise<void>;
  userByFilter(filter: IUserFilter): Promise<PrismaUser | null>;
  getUserById(userId: string): Promise<PrismaUser>;
  updateUser(
    data: UpdateUserDto,
    userId: string,
    securityData: IUpdateSecurityData,
  ): Promise<PrismaUser>;
  cancelUser(userId: string, status: UserStatus): Promise<PrismaUser>;
  findCancelledUsersToDelete(dateThreshold: Date): Promise<PrismaUser[]>;
  deleteUser(userId: string): Promise<void>;
  reactivateAccount(data: reactivateData): Promise<void>;
}
