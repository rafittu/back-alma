import { faker } from '@faker-js/faker';
import {
  Channel,
  User,
  UserContactData,
  UserPersonalData,
  UserSecurityData,
  UserStatus,
} from '@prisma/client';
import { CredentialsDto } from '../../dto/credentials.dto';
import {
  IAuthRequest,
  IResetPassword,
  IUserPayload,
  IUserToken,
} from '../../interfaces/service.interface';
import { Request } from 'express';
import { IUserByToken } from '../../interfaces/auth-repository.interface';

export const MockFakeRequest: Request = {
  socket: {
    remoteAddress: faker.internet.ip(),
  },
} as Request;

export const MockIpAddress = MockFakeRequest.socket.remoteAddress;

export const MockUserCredentials: CredentialsDto = {
  email: faker.internet.email(),
  password: faker.internet.password(),
};

export const MockUser: User = {
  id: faker.string.uuid(),
  user_personal_data_id: faker.string.uuid(),
  user_contact_data_id: faker.string.uuid(),
  user_security_data_id: faker.string.uuid(),
  origin_channel: Channel.WOPHI,
  allowed_channels: [Channel.WOPHI],

  created_at: new Date(),
  updated_at: new Date(),
};

const MockUserPersonalData: UserPersonalData = {
  id: MockUser.user_personal_data_id,
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  cpf: '34151868810',
  social_name: faker.person.fullName(),
  born_date: faker.date.birthdate(),
  mother_name: faker.person.fullName({ sex: 'female' }),
  created_at: MockUser.created_at,
  updated_at: MockUser.updated_at,
};

const MockUserContactData: UserContactData = {
  id: MockUser.user_contact_data_id,
  username: faker.internet.userName(),
  email: MockUserCredentials.email,
  phone: faker.phone.number(),
  created_at: MockUser.created_at,
  updated_at: MockUser.updated_at,
};

export const MockConfirmationToken = faker.string.alphanumeric();
export const MockExpirationTokenTime = faker.date.future();

export const MockUserSecurityData: UserSecurityData = {
  id: MockUser.user_security_data_id,
  hashed_password: MockUserCredentials.password,
  salt: faker.string.binary(),
  confirmation_token: MockConfirmationToken,
  recover_token: faker.string.alphanumeric(),
  token_expires_at: MockExpirationTokenTime,
  ip_address_origin: faker.internet.ip(),
  on_update_ip_address: faker.internet.ip(),
  status: UserStatus.PENDING_CONFIRMATION,
  created_at: MockUser.created_at,
  updated_at: MockUser.updated_at,
};

export const MockUserData = {
  ...MockUser,
  personal: MockUserPersonalData,
  contact: MockUserContactData,
  security: MockUserSecurityData,
};

export const MockJWT = faker.string.alphanumeric();
export const MockRefreshJWT = faker.string.alphanumeric();

export const MockUserPayload: IUserPayload = {
  id: MockUser.id,
  email: MockUserData.contact.email,
  username: MockUserData.contact.username,
  status: MockUserData.security.status,
};

export const MockAccessToken: IUserToken = {
  accessToken: MockJWT,
  refreshToken: MockRefreshJWT,
};

export const MockAuthRequest: IAuthRequest = {
  user: {
    id: MockUserPayload.id,
    username: MockUserPayload.username,
    email: MockUserPayload.email,
  },
  body: {
    origin: Channel.WOPHI,
  },
} as IAuthRequest;

export const MockPrismaUserByToken = {
  ...MockUserSecurityData,
  User: [
    {
      id: MockUserPayload.id,
    },
  ],
};

export const MockUserByToken: IUserByToken = {
  userId: MockPrismaUserByToken.User[0].id,
  tokenExpiresAt: MockPrismaUserByToken.token_expires_at,
};

export const MockResetPassword: IResetPassword = {
  password: 'faker.internet.password()',
  passwordConfirmation: 'faker.internet.password()',
};
