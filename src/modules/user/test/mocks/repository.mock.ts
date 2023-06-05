import { faker } from '@faker-js/faker';
import { UserStatus } from '../../structure/user-status.enum';
import { User } from '../../structure/repository.structure';

export const UnformattedCreatedUser = {
  id: faker.string.uuid(),
  user_personal_info_id: faker.string.uuid(),
  user_contact_info_id: faker.string.uuid(),
  user_security_info_id: faker.string.uuid(),
  personal: {
    first_name: faker.person.firstName(),
    social_name: faker.person.fullName(),
  },
  contact: {
    username: faker.internet.userName(),
    email: faker.internet.email(),
  },
  security: {
    confirmation_token: faker.string.alphanumeric(),
    status: UserStatus.PENDING_CONFIRMATION,
  },
  created_at: new Date(),
  updated_at: new Date(),
};

export const FormattedCreatedUser: User = {
  id: UnformattedCreatedUser.id,
  personal: {
    id: UnformattedCreatedUser.user_personal_info_id,
    firstName: UnformattedCreatedUser.personal.first_name,
    socialName: UnformattedCreatedUser.personal.social_name,
  },
  contact: {
    id: UnformattedCreatedUser.user_contact_info_id,
    username: UnformattedCreatedUser.contact.username,
    email: UnformattedCreatedUser.contact.email,
  },
  security: {
    id: UnformattedCreatedUser.user_security_info_id,
    confirmationToken: UnformattedCreatedUser.security.confirmation_token,
    status: UnformattedCreatedUser.security.status,
  },
  createdAt: UnformattedCreatedUser.created_at,
  updatedAt: UnformattedCreatedUser.updated_at,
};

export const UnformattedUserResponse = {
  id: faker.string.uuid(),
  user_personal_info_id: faker.string.uuid(),
  user_contact_info_id: faker.string.uuid(),
  user_security_info_id: faker.string.uuid(),
  personal: {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    social_name: faker.person.fullName(),
    born_date: faker.date.birthdate().toISOString().split('T')[0],
    mother_name: faker.person.fullName({ sex: 'female' }),
    updated_at: new Date(),
  },
  contact: {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    updated_at: new Date(),
  },
  security: {
    status: UserStatus.ACTIVE,
    updated_at: new Date(),
  },
  created_at: new Date(),
  updated_at: new Date(),
};

export const FormattedUserResponse: User = {
  id: UnformattedUserResponse.id,
  personal: {
    id: UnformattedUserResponse.user_personal_info_id,
    firstName: UnformattedUserResponse.personal.first_name,
    lastName: UnformattedUserResponse.personal.last_name,
    socialName: UnformattedUserResponse.personal.social_name,
    bornDate: UnformattedUserResponse.personal.born_date,
    motherName: UnformattedUserResponse.personal.mother_name,
    updatedAt: UnformattedUserResponse.personal.updated_at,
  },
  contact: {
    id: UnformattedUserResponse.user_contact_info_id,
    username: UnformattedUserResponse.contact.username,
    email: UnformattedUserResponse.contact.email,
    phone: UnformattedUserResponse.contact.phone,
    updatedAt: UnformattedUserResponse.contact.updated_at,
  },
  security: {
    id: UnformattedUserResponse.user_security_info_id,
    status: UnformattedUserResponse.security.status,
    updatedAt: UnformattedUserResponse.security.updated_at,
  },
  createdAt: UnformattedUserResponse.created_at,
  updatedAt: UnformattedUserResponse.updated_at,
};

export const UnformattedDeletedUser = {
  id: faker.string.uuid(),
  user_personal_info_id: faker.string.uuid(),
  user_contact_info_id: faker.string.uuid(),
  user_security_info_id: faker.string.uuid(),
  personal: {
    first_name: faker.person.firstName(),
    social_name: faker.person.fullName(),
  },
  contact: {
    username: faker.internet.userName(),
    email: faker.internet.email(),
  },
  security: {
    status: UserStatus.CANCELLED,
  },
  created_at: new Date(),
  updated_at: new Date(),
};

export const FormattedDeletedUserResponse: User = {
  id: UnformattedDeletedUser.id,
  personal: {
    id: UnformattedDeletedUser.user_personal_info_id,
    firstName: UnformattedDeletedUser.personal.first_name,
    socialName: UnformattedDeletedUser.personal.social_name,
  },
  contact: {
    id: UnformattedDeletedUser.user_contact_info_id,
    username: UnformattedDeletedUser.contact.username,
    email: UnformattedDeletedUser.contact.email,
  },
  security: {
    id: UnformattedDeletedUser.user_security_info_id,
    status: UnformattedDeletedUser.security.status,
  },
  createdAt: UnformattedDeletedUser.created_at,
  updatedAt: UnformattedDeletedUser.updated_at,
};
