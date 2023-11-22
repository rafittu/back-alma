import { Request } from 'express';
import { faker } from '@faker-js/faker';
import { CreateUserDto } from '../../dto/create-user.dto';
import { User } from '../../interfaces/repository.interface';
import { UserStatus } from '../../interfaces/user-status.enum';
import { UpdateUserDto } from '../../dto/update-user.dto';

export const mockFakeRequest: Request = {
  socket: {
    remoteAddress: faker.internet.ip(),
  },
} as Request;

export const mockCreateUserBody: CreateUserDto = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  socialName: faker.person.fullName(),
  username: faker.internet.userName(),
  bornDate: faker.date.birthdate().toISOString().split('T')[0],
  motherName: faker.person.fullName({ sex: 'female' }),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  password: '@Password123',
  passwordConfirmation: '@Password123',
};

export const mockNewUser: User = {
  id: faker.string.uuid(),
  personal: {
    id: faker.string.uuid(),
    firstName: mockCreateUserBody.firstName,
    lastName: mockCreateUserBody.lastName,
    socialName: mockCreateUserBody.socialName,
    bornDate: mockCreateUserBody.bornDate,
    motherName: mockCreateUserBody.motherName,
    updatedAt: faker.date.recent(),
  },
  contact: {
    id: faker.string.uuid(),
    username: mockCreateUserBody.username,
    email: mockCreateUserBody.email,
    phone: mockCreateUserBody.phone,
    updatedAt: faker.date.recent(),
  },
  security: {
    id: faker.string.uuid(),
    confirmationToken: faker.string.alphanumeric(),
    status: UserStatus.PENDING_CONFIRMATION,
    updatedAt: faker.date.recent(),
  },
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
};

export const mockUpdateUser: UpdateUserDto = {
  username: faker.internet.userName(),
};

export const mockUpdateUserResponse: User = {
  id: mockNewUser.id,
  personal: {
    id: mockNewUser.personal.id,
    firstName: mockNewUser.personal.firstName,
    socialName: mockNewUser.personal.socialName,
    updatedAt: mockNewUser.personal.updatedAt,
  },
  contact: {
    id: mockNewUser.contact.id,
    username: mockUpdateUser.username,
    email: mockNewUser.contact.email,
    updatedAt: faker.date.recent(),
  },
  security: {
    id: mockNewUser.security.id,
    status: UserStatus.ACTIVE,
    updatedAt: mockNewUser.security.updatedAt,
  },
  createdAt: mockNewUser.createdAt,
  updatedAt: faker.date.recent(),
};

export const mockDeleteUserResponse: User = {
  id: mockNewUser.id,
  personal: {
    id: mockNewUser.personal.id,
    firstName: mockNewUser.personal.firstName,
    socialName: mockNewUser.personal.socialName,
  },
  contact: {
    id: mockNewUser.contact.id,
    username: mockUpdateUser.username,
    email: mockNewUser.contact.email,
  },
  security: {
    id: mockNewUser.security.id,
    status: UserStatus.CANCELLED,
  },
  createdAt: mockNewUser.createdAt,
  updatedAt: faker.date.recent(),
};
