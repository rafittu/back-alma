import { faker } from '@faker-js/faker';
import { CredentialsDto } from '../../dto/credentials.dto';
import { UserPayload } from '../../structure/service.structure';
import { UserStatus } from '@prisma/client';

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

export const getUserSecurityInfoResponse = {
  id: faker.string.uuid(),
  confirmation_token: faker.string.alphanumeric(),
  password: faker.internet.password(),
  salt: faker.string.numeric(),
  recover_token: faker.string.alphanumeric(),
  ip_address: faker.number.bigInt(),
  status: UserStatus.ACTIVE,
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
};
