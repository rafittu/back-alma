import { faker } from '@faker-js/faker';
import {
  AuthRequest,
  UserPayload,
  UserToken,
} from '../../interfaces/service.interface';
import { ChangePasswordDto } from '../../dto/change-password.dto';

export const accessTokenMock: UserToken = {
  accessToken: faker.string.alphanumeric(),
};

export const authRequestMock: AuthRequest = Object.create(
  AuthRequest.prototype,
);
authRequestMock.user = {
  id: faker.string.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
};

export const confirmationTokenMock = faker.string.alphanumeric();

export const accountConfirmResponse = {
  message: 'account email successfully confirmed',
};

export const userEmailMock = faker.internet.email();

export const recoverPasswordEmailResponse = {
  message: 'recover password email sent',
};

export const resetPasswordMock: ChangePasswordDto = {
  password: 'newPassword',
  passwordConfirmation: 'newPassword',
};

export const resetPasswordResponse = {
  message: 'password reseted',
};

export const userPayloadMock: UserPayload = {
  id: faker.string.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
};
