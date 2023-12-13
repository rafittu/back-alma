import { faker } from '@faker-js/faker';
import {
  Channel,
  User,
  UserContactInfo,
  UserPersonalInfo,
  UserSecurityInfo,
  UserStatus,
} from '@prisma/client';
import { CredentialsDto } from '../../dto/credentials.dto';
import {
  AuthRequest,
  UserPayload,
  UserToken,
} from '../../structure/service.structure';

export const MockUserCredentials: CredentialsDto = {
  email: faker.internet.email(),
  password: faker.internet.password(),
};

export const MockUser: User = {
  id: faker.string.uuid(),
  user_personal_info_id: faker.string.uuid(),
  user_contact_info_id: faker.string.uuid(),
  user_security_info_id: faker.string.uuid(),
  origin_channel: Channel.WOPHI,
  allowed_channels: [Channel.WOPHI],

  created_at: new Date(),
  updated_at: new Date(),
};

const MockUserPersonalInfo: UserPersonalInfo = {
  id: MockUser.user_personal_info_id,
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  social_name: faker.person.fullName(),
  born_date: faker.date.birthdate().toISOString().split('T')[0],
  mother_name: faker.person.fullName({ sex: 'female' }),
  created_at: MockUser.created_at,
  updated_at: MockUser.updated_at,
};

const MockUserContactInfo: UserContactInfo = {
  id: MockUser.user_contact_info_id,
  username: faker.internet.userName(),
  email: MockUserCredentials.email,
  phone: faker.phone.number(),
  created_at: MockUser.created_at,
  updated_at: MockUser.updated_at,
};

const MockUserSecurityInfo: UserSecurityInfo = {
  id: MockUser.user_security_info_id,
  password: MockUserCredentials.password,
  salt: faker.string.binary(),
  confirmation_token: faker.string.alphanumeric(),
  recover_token: faker.string.alphanumeric(),
  ip_address_origin: faker.internet.ip(),
  on_update_ip_address: faker.internet.ip(),
  status: UserStatus.PENDING_CONFIRMATION,
  created_at: MockUser.created_at,
  updated_at: MockUser.updated_at,
};

export const MockUserData = {
  ...MockUser,
  personal: MockUserPersonalInfo,
  contact: MockUserContactInfo,
  security: MockUserSecurityInfo,
};

export const MockJWT = faker.string.alphanumeric();

export const MockUserPayload: UserPayload = {
  id: MockUser.id,
  email: MockUserData.contact.email,
  username: MockUserData.contact.username,
};

export const MockAccessToken: UserToken = {
  accessToken: MockJWT,
};

export const MockAuthRequest: AuthRequest = {
  user: {
    id: MockUserPayload.id,
    username: MockUserPayload.username,
    email: MockUserPayload.email,
  },
  body: {
    origin: Channel.WOPHI,
  },
} as AuthRequest;
