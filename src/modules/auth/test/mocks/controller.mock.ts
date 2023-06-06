import { faker } from '@faker-js/faker';
import { AuthRequest, UserToken } from '../../structure/service.structure';

export const accessTokenMock: UserToken = {
  accessToken: faker.string.alphanumeric(),
};

export const authRequestMock: AuthRequest = Object.create(
  AuthRequest.prototype,
);
authRequestMock.user = {
  id: faker.string.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
};

export const confirmationTokenMock = faker.string.alphanumeric();

export const accountConfirmResponse = {
  message: 'account email successfully confirmed',
};
