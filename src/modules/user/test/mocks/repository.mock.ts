import { faker } from '@faker-js/faker';
import { UserStatus } from '../../structure/user-status.enum';
import { User } from '../../structure/repository.structure';

export const UnformattedUserPrismaResponse = {
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
    confirmation_token: faker.string.alphanumeric(),
    status: UserStatus.ACTIVE,
    updated_at: new Date(),
  },
  created_at: new Date(),
  updated_at: new Date(),
};

export const FormattedUserResponse: User = {
  id: UnformattedUserPrismaResponse.id,
  personal: {
    id: UnformattedUserPrismaResponse.user_personal_info_id,
    firstName: UnformattedUserPrismaResponse.personal.first_name,
    lastName: UnformattedUserPrismaResponse.personal.last_name,
    socialName: UnformattedUserPrismaResponse.personal.social_name,
    bornDate: UnformattedUserPrismaResponse.personal.born_date,
    motherName: UnformattedUserPrismaResponse.personal.mother_name,
    updatedAt: UnformattedUserPrismaResponse.personal.updated_at,
  },
  contact: {
    id: UnformattedUserPrismaResponse.user_contact_info_id,
    username: UnformattedUserPrismaResponse.contact.username,
    email: UnformattedUserPrismaResponse.contact.email,
    phone: UnformattedUserPrismaResponse.contact.phone,
    updatedAt: UnformattedUserPrismaResponse.contact.updated_at,
  },
  security: {
    id: UnformattedUserPrismaResponse.user_security_info_id,
    confirmationToken:
      UnformattedUserPrismaResponse.security.confirmation_token,
    status: UnformattedUserPrismaResponse.security.status,
    updatedAt: UnformattedUserPrismaResponse.security.updated_at,
  },
  createdAt: UnformattedUserPrismaResponse.created_at,
  updatedAt: UnformattedUserPrismaResponse.updated_at,
};
