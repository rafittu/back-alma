import { faker } from '@faker-js/faker';
import { CredentialsDto } from '../../dto/credentials.dto';
import { UserPayload } from '../../structure/service.structure';

export const userCredentialsMock: CredentialsDto = {
  email: faker.internet.email(),
  password: faker.internet.password(),
};

export const getUserCredentialsResponse = {
  id: faker.string.uuid(),
  username: faker.internet.userName(),
  email: userCredentialsMock.email,
  phone: faker.phone.number(),
  User: [
    {
      id: faker.string.uuid(),
      security: {
        password: faker.internet.password(),
      },
    },
  ],
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
};

export const validatedUserMockResponse: UserPayload = {
  id: getUserCredentialsResponse.User[0].id,
  email: getUserCredentialsResponse.email,
  username: getUserCredentialsResponse.username,
};
