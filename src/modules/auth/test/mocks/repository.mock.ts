import { faker } from '@faker-js/faker';
import { CredentialsDto } from '../../dto/credentials.dto';
import { UserPayload } from '../../interfaces/service.interface';
import { UserStatus } from '@prisma/client';
import { ResendAccToken } from '../../interfaces/auth-repository.interface';

export const userCredentialsMock: CredentialsDto = {
  email: faker.internet.email(),
  password: faker.internet.password(),
};

export const getUserCredentialsResponse = {
  id: faker.string.uuid(),
  user_personal_info_id: faker.string.uuid(),
  user_contact_info_id: faker.string.uuid(),
  user_security_info_id: faker.string.uuid(),
  contact: {
    username: faker.internet.userName(),
  },
  security: {
    password: userCredentialsMock.password,
  },
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
};

export const validatedUserMockResponse: UserPayload = {
  id: getUserCredentialsResponse.id,
  email: userCredentialsMock.email,
  username: getUserCredentialsResponse.contact.username,
};

export const getUserSecurityInfoResponse = {
  id: faker.string.uuid(),
  confirmation_token: faker.string.alphanumeric(),
  password: faker.internet.password(),
  salt: faker.string.numeric(),
  recover_token: faker.string.alphanumeric(),
  ip_address: faker.internet.ip(),
  status: UserStatus.ACTIVE,
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
};

export const mockPrismaUpdateConfirmationToken = {
  id: faker.string.uuid(),
  user_personal_info_id: faker.string.uuid(),
  user_contact_info_id: faker.string.uuid(),
  user_security_info_id: faker.string.uuid(),
  contact: {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    email: userCredentialsMock.email,
    phone: faker.phone.number(),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  },
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
};

export const mockConfirmationToken = faker.string.alphanumeric();

export const mockResendAccountTokenResponse = {
  confirmationToken: mockConfirmationToken,
};
