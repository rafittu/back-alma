import { faker } from '@faker-js/faker';
import {
  Channel,
  User,
  UserContactInfo,
  UserPersonalInfo,
  UserSecurityInfo,
} from '@prisma/client';
import {
  ICreateUser,
  IDefaultMessage,
  IReactivateUserAccount,
  IRequestChannelAccess,
  IUpdateSecurityData,
  IUpdateUser,
  IUser,
} from '../../interfaces/user.interface';
import { UserStatus } from '../../interfaces/user-status.enum';
import { CreateUserDto } from '../../dto/create-user.dto';
import { Request } from 'express';
import {
  PrismaUser,
  reactivateData,
} from '../../interfaces/repository.interface';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { IUserPayload } from 'src/modules/auth/interfaces/service.interface';
import { IUserByToken } from 'src/modules/auth/interfaces/auth-repository.interface';

export const MockFakeRequest: Request = {
  socket: {
    remoteAddress: faker.internet.ip(),
  },
} as Request;

export const MockIpAddress = MockFakeRequest.socket.remoteAddress;

export const MockJWT = faker.string.alphanumeric();
export const MockRefreshJWT = faker.string.alphanumeric();

export const MockCreateUserDto: CreateUserDto = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  socialName: faker.person.fullName(),
  bornDate: faker.date.birthdate().toISOString().split('T')[0],
  motherName: faker.person.fullName({ sex: 'female' }),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  password: 'faker.internet.password()',
  passwordConfirmation: 'faker.internet.password()',
  originChannel: Channel.WOPHI,
};

export const MockICreateUser: ICreateUser = {
  firstName: MockCreateUserDto.firstName,
  lastName: MockCreateUserDto.lastName,
  socialName: MockCreateUserDto.socialName,
  bornDate: MockCreateUserDto.bornDate,
  motherName: MockCreateUserDto.motherName,
  username: MockCreateUserDto.username,
  email: MockCreateUserDto.email,
  phone: MockCreateUserDto.phone,
  hashedPassword: faker.internet.password(),
  salt: faker.string.binary(),
  confirmationToken: faker.string.alphanumeric(),
  tokenExpiresAt: faker.date.future(),
  ipAddressOrigin: MockIpAddress,
  originChannel: MockCreateUserDto.originChannel,
  allowedChannels: [Channel.WOPHI],
  status: UserStatus.PENDING_CONFIRMATION,
};

export const MockUser: User = {
  id: faker.string.uuid(),
  user_personal_info_id: faker.string.uuid(),
  user_contact_info_id: faker.string.uuid(),
  user_security_info_id: faker.string.uuid(),
  origin_channel: Channel.WOPHI,
  allowed_channels: [Channel.WOPHI],

  created_at: new Date(),
  updated_at: new Date(),
};

export const MockRequestChannelAccess: IRequestChannelAccess = {
  id: MockUser.user_security_info_id,
  ipAddress: MockIpAddress,
  confirmationToken: faker.string.alphanumeric(),
  tokenExpiresAt: faker.date.future(),
};

const MockUserPersonalInfo: UserPersonalInfo = {
  id: MockUser.user_personal_info_id,
  first_name: MockICreateUser.firstName,
  last_name: MockICreateUser.lastName,
  social_name: MockICreateUser.socialName,
  born_date: MockICreateUser.bornDate,
  mother_name: MockICreateUser.motherName,
  created_at: MockUser.created_at,
  updated_at: MockUser.updated_at,
};

const MockUserContactInfo: UserContactInfo = {
  id: MockUser.user_contact_info_id,
  username: MockICreateUser.username,
  email: MockICreateUser.email,
  phone: MockICreateUser.phone,
  created_at: MockUser.created_at,
  updated_at: MockUser.updated_at,
};

const MockUserSecurityInfo: UserSecurityInfo = {
  id: MockUser.user_security_info_id,
  password: MockICreateUser.hashedPassword,
  salt: MockICreateUser.salt,
  confirmation_token: MockICreateUser.confirmationToken,
  recover_token: faker.string.alphanumeric(),
  token_expires_at: new Date(MockICreateUser.tokenExpiresAt),
  ip_address_origin: MockIpAddress,
  on_update_ip_address: MockIpAddress,
  status: MockICreateUser.status,
  created_at: MockUser.created_at,
  updated_at: MockUser.updated_at,
};

export const MockUserData = {
  ...MockUser,
  personal: MockUserPersonalInfo,
  contact: MockUserContactInfo,
  security: MockUserSecurityInfo,
};

export const MockPrismaUser: PrismaUser = {
  id: MockUserData.id,
  personal: {
    id: MockUserData.personal.id,
    first_name: MockUserData.personal.first_name,
    last_name: MockUserData.personal.last_name,
    social_name: MockUserData.personal.social_name,
    born_date: MockUserData.personal.born_date,
    mother_name: MockUserData.personal.mother_name,
    updated_at: MockUserData.personal.updated_at,
  },
  contact: {
    id: MockUserData.contact.id,
    username: MockUserData.contact.username,
    email: MockUserData.contact.email,
    phone: MockUserData.contact.phone,
    updated_at: MockUserData.contact.updated_at,
  },
  security: {
    id: MockUserData.security.id,
    status: MockUserData.security.status,
    updated_at: MockUserData.security.updated_at,
  },
  allowed_channels: MockUserData.allowed_channels,
  created_at: MockUserData.created_at,
  updated_at: MockUserData.updated_at,
};

export const MockIUser: IUser = {
  id: MockPrismaUser.id,
  personal: {
    id: MockPrismaUser.personal.id,
    firstName: MockPrismaUser.personal.first_name,
    lastName: MockPrismaUser.personal.last_name,
    socialName: MockPrismaUser.personal.social_name,
    bornDate: MockPrismaUser.personal.born_date,
    motherName: MockPrismaUser.personal.mother_name,
    updatedAt: MockPrismaUser.personal.updated_at,
  },
  contact: {
    id: MockPrismaUser.contact.id,
    username: MockPrismaUser.contact.username,
    email: MockPrismaUser.contact.email,
    phone: MockPrismaUser.contact.phone,
    updatedAt: MockPrismaUser.contact.updated_at,
  },
  security: {
    id: MockPrismaUser.security.id,
    status: MockPrismaUser.security.status,
    updatedAt: MockPrismaUser.security.updated_at,
  },
  allowedChannels: MockPrismaUser.allowed_channels,
  createdAt: MockPrismaUser.created_at,
  updatedAt: MockPrismaUser.updated_at,
};

export const MockIUpdateUser: IUpdateUser = {
  accessToken: MockJWT,
  refreshToken: MockRefreshJWT,
  ...MockIUser,
};

export const MockUpdateUserDto: UpdateUserDto = {
  username: faker.internet.userName(),
  email: faker.internet.email(),
  oldPassword: faker.internet.password(),
  newPassword: 'faker.internet.password()',
  passwordConfirmation: 'faker.internet.password()',
};

export const MockUpdateSecurityData: IUpdateSecurityData = {
  hashedPassword: faker.internet.password(),
  salt: faker.string.binary(),
  confirmationToken: faker.string.alphanumeric(),
  onUpdateIpAddress: MockIpAddress,
  status: UserStatus.PENDING_CONFIRMATION,
};

export const MockUserFromJwt: IUserPayload = {
  id: MockUserData.id,
  username: MockUserData.contact.username,
  email: MockUserData.contact.email,
  status: MockUserData.security.status,
};

export const MockDefaultMessage: IDefaultMessage = {
  message: 'object default message',
};

export const MockCancelledAccount = {
  ...MockUserData,
  security: {
    ...MockUserData.security,
    status: UserStatus.CANCELLED,
  },
};

export const MockReactivateUserAccount: IReactivateUserAccount = {
  email: MockCancelledAccount.contact.email,
  originChannel: MockCancelledAccount.origin_channel,
};

export const MockGenerateRandomToken = {
  token: faker.string.alphanumeric(),
  expiresAt: faker.date.soon(),
};

export const MockReactivateAccountData: reactivateData = {
  id: MockCancelledAccount.id,
  ipAddress: MockIpAddress,
  confirmationToken: MockGenerateRandomToken.token,
  tokenExpiresAt: MockGenerateRandomToken.expiresAt,
};

export const MockUserByToken: IUserByToken = {
  userId: MockReactivateAccountData.id,
  tokenExpiresAt: MockReactivateAccountData.tokenExpiresAt,
};
