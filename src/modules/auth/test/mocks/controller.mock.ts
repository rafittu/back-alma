import { faker } from '@faker-js/faker';
import { AuthRequest } from '../../structure/service.structure';

export const accessTokenMock = {
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
