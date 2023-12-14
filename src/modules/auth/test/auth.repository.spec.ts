import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../repository/auth.repository';
import {
  getUserCredentialsResponse,
  getUserSecurityInfoResponse,
  mockConfirmationToken,
  mockPrismaUpdateConfirmationToken,
  mockResendAccountTokenResponse,
  userCredentialsMock,
  validatedUserMockResponse,
} from './mocks/repository.mock';
import { AppError } from '../../../common/errors/Error';
import { UserStatus } from '../../user/interfaces/user-status.enum';
import {
  accountConfirmResponse,
  confirmationTokenMock,
  resetPasswordResponse,
  userEmailMock,
} from './mocks/controller.mock';
import { recoverTokenMock } from './mocks/services.mock';
import * as Crypto from 'crypto';
import {
  MockConfirmationToken,
  MockUserCredentials,
  MockUserData,
  MockUserPayload,
} from './mocks/auth.mock';
import { Channel } from '@prisma/client';

describe('Auth Repository', () => {
  let authRepository: AuthRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRepository, PrismaService],
    }).compile();

    authRepository = module.get<AuthRepository>(AuthRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(authRepository).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('validate user', () => {
    it('should validate user credentials successfully', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(MockUserData);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authRepository.validateUser(MockUserCredentials);

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockUserPayload);
    });

    it('should throw an error if email or password is invalid', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockReturnValueOnce(null);

      try {
        await authRepository.validateUser(MockUserCredentials);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(401);
        expect(error.message).toBe('email or password is invalid');
      }
    });
  });

  describe('validate access to channels', () => {
    it('should validate user allowed channels successfully', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(MockUserData);

      const signInChannel = 'WOPHI';

      await authRepository.validateChannel(MockUserData.id, signInChannel);

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if user not allowed to access channel', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockReturnValueOnce(null);

      const signInChannel = 'LUMIN';

      try {
        await authRepository.validateChannel(MockUserData.id, signInChannel);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(401);
        expect(error.message).toBe('email or password is invalid');
      }
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockReturnValueOnce(null);

      const signInChannel = 'WOPHI';

      try {
        await authRepository.validateChannel(null, signInChannel);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(401);
        expect(error.message).toBe('email or password is invalid');
      }
    });
  });

  describe('resend confirm account token email', () => {
    it('should return a confirmation token and channel origin', async () => {
      jest
        .spyOn(Crypto, 'randomBytes')
        .mockReturnValueOnce(MockConfirmationToken as never);

      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce(MockUserData);

      const result = await authRepository.resendAccountToken(
        MockUserData.id,
        MockUserData.contact.email,
      );

      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        confirmationToken: MockConfirmationToken,
        originChannel: MockUserData.origin_channel,
      });
    });

    it('should throw an error if confirmation token not generated', async () => {
      jest.spyOn(prismaService.user, 'update').mockRejectedValueOnce(null);

      try {
        await authRepository.resendAccountToken(
          MockUserData.id,
          MockUserData.contact.email,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('Account token not generated');
      }
    });
  });

  describe('confirm account email', () => {
    it('should validate user email account successfully', async () => {
      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockResolvedValueOnce(MockUserData.security);

      const result = await authRepository.confirmAccountEmail(
        MockConfirmationToken,
        UserStatus.ACTIVE,
      );

      const response = { message: 'account email successfully confirmed' };

      expect(prismaService.userSecurityInfo.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });

    it('should add new channel successfully', async () => {
      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockResolvedValueOnce(MockUserData.security);

      jest.spyOn(prismaService.user, 'update').mockResolvedValueOnce(null);

      const result = await authRepository.confirmAccountEmail(
        MockConfirmationToken,
        UserStatus.ACTIVE,
        Channel.MIAU,
      );

      const response = { message: 'account email successfully confirmed' };

      expect(prismaService.userSecurityInfo.update).toHaveBeenCalledTimes(1);
      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });

    // it('should throw an error if account not confirmed', async () => {
    //   jest
    //     .spyOn(prismaService.userSecurityInfo, 'update')
    //     .mockRejectedValueOnce('invalid confirmation token');

    //   try {
    //     await authRepository.confirmAccountEmail(
    //       confirmationTokenMock,
    //       UserStatus.ACTIVE,
    //     );
    //   } catch (error) {
    //     expect(error).toBeInstanceOf(AppError);
    //     expect(error.code).toBe(500);
    //     expect(error.message).toBe('Account not confirmed');
    //   }
    // });
  });

  // describe('send recover password email', () => {
  //   it('should return an user recover token successfully', async () => {
  //     jest
  //       .spyOn(prismaService.user, 'findFirst')
  //       .mockResolvedValueOnce(getUserCredentialsResponse);

  //     jest
  //       .spyOn(Crypto, 'randomBytes')
  //       .mockReturnValueOnce(recoverTokenMock as never);

  //     jest
  //       .spyOn(prismaService.userSecurityInfo, 'update')
  //       .mockResolvedValueOnce(null);

  //     const result =
  //       await authRepository.sendRecoverPasswordEmail(userEmailMock);

  //     expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
  //     expect(prismaService.userSecurityInfo.update).toHaveBeenCalledTimes(1);
  //     expect(result).toEqual(recoverTokenMock);
  //   });

  //   it('should throw an error if password recover email is not sent', async () => {
  //     jest.spyOn(prismaService.user, 'findFirst').mockResolvedValueOnce(null);

  //     try {
  //       await authRepository.sendRecoverPasswordEmail(userEmailMock);
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(AppError);
  //       expect(error.code).toBe(404);
  //       expect(error.message).toBe('user with this email not found');
  //     }
  //   });
  // });

  // describe('reset password', () => {
  //   it('should reset user account password', async () => {
  //     jest
  //       .spyOn(prismaService.userSecurityInfo, 'findFirst')
  //       .mockResolvedValueOnce(getUserSecurityInfoResponse);

  //     jest
  //       .spyOn(prismaService.userSecurityInfo, 'update')
  //       .mockResolvedValueOnce(null);

  //     const result = await authRepository.resetPassword(
  //       recoverTokenMock,
  //       userCredentialsMock.password,
  //     );

  //     expect(prismaService.userSecurityInfo.findFirst).toHaveBeenCalledTimes(1);
  //     expect(prismaService.userSecurityInfo.update).toHaveBeenCalledTimes(1);
  //     expect(result).toEqual(resetPasswordResponse);
  //   });

  //   it('should throw an error if recover token is invalid', async () => {
  //     jest
  //       .spyOn(prismaService.userSecurityInfo, 'findFirst')
  //       .mockResolvedValueOnce(null);

  //     try {
  //       await authRepository.resetPassword(
  //         recoverTokenMock,
  //         userCredentialsMock.password,
  //       );
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(AppError);
  //       expect(error.code).toBe(404);
  //       expect(error.message).toBe('invalid recover token');
  //     }
  //   });

  //   it('should throw an error if password not reseted', async () => {
  //     jest
  //       .spyOn(prismaService.userSecurityInfo, 'findFirst')
  //       .mockResolvedValueOnce(getUserSecurityInfoResponse);

  //     jest
  //       .spyOn(prismaService.userSecurityInfo, 'update')
  //       .mockRejectedValueOnce('user not updated');

  //     try {
  //       await authRepository.resetPassword(
  //         recoverTokenMock,
  //         userCredentialsMock.password,
  //       );
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(AppError);
  //       expect(error.code).toBe(500);
  //       expect(error.message).toBe('password not reseted');
  //     }
  //   });
  // });
});
