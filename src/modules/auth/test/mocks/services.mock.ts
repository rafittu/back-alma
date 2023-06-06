import { faker } from '@faker-js/faker';
import { JtwPayload, UserPayload } from '../../structure/service.structure';

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
