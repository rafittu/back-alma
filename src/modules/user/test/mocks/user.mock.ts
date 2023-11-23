import { faker } from '@faker-js/faker';
import { Channel, User } from '@prisma/client';
import { ICreateUser } from '../../interfaces/user.interface';
import { UserStatus } from '../../interfaces/user-status.enum';

export const MockInterfaceCreateUser: ICreateUser = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  socialName: faker.person.fullName(),
  bornDate: faker.date.birthdate().toISOString().split('T')[0],
  motherName: faker.person.fullName({ sex: 'female' }),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  password: faker.internet.password({
    pattern: /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
  }),
  salt: faker.string.binary(),
  confirmationToken: faker.string.alphanumeric(),
  ipAddressOrigin: faker.internet.ipv4(),
  originChannel: Channel.WOPHI,
  allowedChannels: [Channel.WOPHI],
  status: UserStatus.PENDING_CONFIRMATION,
};

export const MockPrismaUser: User = {
  id: faker.string.uuid(),
  user_personal_info_id: faker.string.uuid(),
  user_contact_info_id: faker.string.uuid(),
  user_security_info_id: faker.string.uuid(),
  origin_channel: Channel.WOPHI,
  allowed_channels: [Channel.WOPHI],

  created_at: new Date(),
  updated_at: new Date(),
};
