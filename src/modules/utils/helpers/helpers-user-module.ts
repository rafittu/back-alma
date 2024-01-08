import { PrismaUser } from 'src/modules/user/interfaces/repository.interface';
import { IUser } from 'src/modules/user/interfaces/user.interface';

export const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

export const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

export function mapUserToReturn(prismaUser: PrismaUser): IUser {
  const { personal, contact, security } = prismaUser;
  const { first_name, last_name, social_name, born_date, mother_name } =
    personal;
  const { username, email, phone } = contact;

  return {
    id: prismaUser.id,
    personal: {
      id: personal.id,
      firstName: first_name,
      lastName: last_name,
      socialName: social_name,
      bornDate: born_date,
      motherName: mother_name,
      updatedAt: personal.updated_at,
    },
    contact: {
      id: contact.id,
      username,
      email,
      phone,
      updatedAt: contact.updated_at,
    },
    security: {
      id: security.id,
      status: security.status,
      updatedAt: security.updated_at,
    },
    allowedChannels: prismaUser.allowed_channels,
    createdAt: prismaUser.created_at,
    updatedAt: prismaUser.updated_at,
  };
}
