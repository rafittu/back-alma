import { faker } from '@faker-js/faker';
import { JtwPayload, UserPayload } from '../../interfaces/service.interface';
import { ResendAccToken } from '../../interfaces/auth-repository.interface';
import { UserStatus } from '../../../user/interfaces/user-status.enum';

export const signinPayloadMock: UserPayload = {
  id: faker.string.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
};

export const jwtPayloadMock: JtwPayload = {
  sub: signinPayloadMock.id,
  username: signinPayloadMock.username,
  email: signinPayloadMock.email,
};

export const jwtTokenMock = faker.string.alphanumeric();

export const recoverTokenMock = faker.string.alphanumeric();

export const mockResendAccountTokenResponse = {
  confirmationToken: faker.string.alphanumeric(),
};

export const mockUser = {
  id: signinPayloadMock.id,
  personal: {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    socialName: faker.person.fullName(),
    bornDate: faker.date.birthdate().toISOString(),
    motherName: faker.person.fullName(),
    updatedAt: faker.date.recent(),
  },
  contact: {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    updatedAt: faker.date.recent(),
  },
  security: {
    id: faker.string.uuid(),
    status: UserStatus.ACTIVE,
    updatedAt: faker.date.recent(),
  },
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
};
