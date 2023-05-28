import { faker } from '@faker-js/faker';
import { ICreateUser } from '../../structure/service.structure';
import { UpdateUserDto } from '../../dto/update-user.dto';

export const mockCreateUser: ICreateUser = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  socialName: faker.person.fullName(),
  username: faker.internet.userName(),
  bornDate: faker.date.birthdate().toISOString().split('T')[0],
  motherName: faker.person.fullName({ sex: 'female' }),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  password: '@Password123',
  passwordConfirmation: '@Password123',
  ipAddress: faker.internet.ip(),
};

export const mockUpdateUser: UpdateUserDto = {
  username: faker.internet.userName(),
};

export const mockUpdateUserEmail: UpdateUserDto = {
  email: faker.internet.email(),
};

export const mockUpdateAccountPassword: UpdateUserDto = {
  oldPassword: mockCreateUser.password,
  newPassword: faker.internet.password(),
  passwordConfirmation: faker.internet.password(),
};

export const updatePasswordInvalidBody: UpdateUserDto = {
  newPassword: faker.internet.password(),
  passwordConfirmation: faker.internet.password(),
};
