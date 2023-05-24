import { faker } from '@faker-js/faker';
import { Request } from 'express';
import { CreateUserDto } from '../../dto/create-user.dto';
import { User } from '../../structure/repository.structure';
import { UserStatus } from '../../structure/user-status.enum';

function createMockRequest(remoteAddress: string): Request {
  return {
    socket: {
      remoteAddress,
    },
  } as Request;
}

export const mockFakeRequest: Request = createMockRequest(faker.internet.ip());

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
    motherName: mockCreateUserBody.bornDate,
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
