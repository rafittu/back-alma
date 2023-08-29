import { faker } from '@faker-js/faker';
import { JtwPayload, UserPayload } from '../../structure/service.structure';
import { ResendAccToken } from '../../structure/auth-repository.structure';

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

export const mockResendAccountTokenResponse: ResendAccToken = {
  email: signinPayloadMock.email,
  confirmationToken: faker.string.alphanumeric(),
};
