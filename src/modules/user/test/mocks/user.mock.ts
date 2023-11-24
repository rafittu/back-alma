import { faker } from '@faker-js/faker';
import { Channel, User } from '@prisma/client';
import { ICreateUser, IUser } from '../../interfaces/user.interface';
import { UserStatus } from '../../interfaces/user-status.enum';
import { CreateUserDto } from '../../dto/create-user.dto';
import { Request } from 'express';

export const MockFakeRequest: Request = {
  socket: {
    remoteAddress: faker.internet.ip(),
  },
} as Request;

export const MockIpAddress = MockFakeRequest.socket.remoteAddress;

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
  password: faker.internet.password(),
  salt: faker.string.binary(),
  confirmationToken: faker.string.alphanumeric(),
  ipAddressOrigin: MockIpAddress,
  originChannel: MockCreateUserDto.originChannel,
  allowedChannels: [Channel.WOPHI],
  status: UserStatus.PENDING_CONFIRMATION,
};

export const MockPrismaUser: User = {
  id: faker.string.uuid(),
  user_personal_info_id: faker.string.uuid(),
  user_contact_info_id: faker.string.uuid(),
  user_security_info_id: faker.string.uuid(),
  origin_channel: Channel.WOPHI,
  allowed_channels: [Channel.WOPHI],

  created_at: new Date(),
  updated_at: new Date(),
};

export const MockIUser: IUser = {
  id: MockPrismaUser.id,
  personal: {
    id: MockPrismaUser.user_personal_info_id,
    firstName: MockICreateUser.firstName,
    lastName: MockICreateUser.lastName,
    socialName: MockICreateUser.socialName,
    bornDate: MockICreateUser.bornDate,
    motherName: MockICreateUser.motherName,
  },
  contact: {
    id: MockPrismaUser.user_contact_info_id,
    username: MockICreateUser.username,
    email: MockICreateUser.email,
    phone: MockICreateUser.phone,
  },
  security: {
    id: MockPrismaUser.user_security_info_id,
    status: UserStatus.PENDING_CONFIRMATION,
  },
  allowedChannels: MockPrismaUser.allowed_channels,
  createdAt: MockPrismaUser.created_at,
  updatedAt: MockPrismaUser.updated_at,
};
