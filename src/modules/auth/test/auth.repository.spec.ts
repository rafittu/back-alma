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
import { UserStatus } from '../../user/structure/user-status.enum';
import {
  accountConfirmResponse,
  confirmationTokenMock,
  resetPasswordResponse,
  userEmailMock,
} from './mocks/controller.mock';
import { recoverTokenMock } from './mocks/services.mock';
import * as Crypto from 'crypto';

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
        .spyOn(prismaService.userContactInfo, 'findUnique')
        .mockResolvedValueOnce(getUserCredentialsResponse);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authRepository.validateUser(userCredentialsMock);

      expect(prismaService.userContactInfo.findUnique).toHaveBeenCalledTimes(1);
      expect(result).toEqual(validatedUserMockResponse);
    });

    it('should throw an error if email or password is invalid', async () => {
      jest
        .spyOn(prismaService.userContactInfo, 'findUnique')
        .mockReturnValueOnce(null);

      try {
        await authRepository.validateUser(userCredentialsMock);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(401);
        expect(error.message).toBe('email or password is invalid');
      }
    });
  });

  describe('confirm account email', () => {
    it('should validate user email account successfully', async () => {
      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockResolvedValueOnce(null);

      const result = await authRepository.confirmAccountEmail(
        confirmationTokenMock,
        UserStatus.ACTIVE,
      );

      expect(prismaService.userSecurityInfo.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(accountConfirmResponse);
    });

    it('should throw an error if account not confirmed', async () => {
      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockRejectedValueOnce('invalid confirmation token');

      try {
        await authRepository.confirmAccountEmail(
          confirmationTokenMock,
          UserStatus.ACTIVE,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('Account not confirmed');
      }
    });
  });

  describe('send recover password email', () => {
    it('should return an user recover token successfully', async () => {
      jest
        .spyOn(prismaService.userContactInfo, 'findFirst')
        .mockResolvedValueOnce(getUserCredentialsResponse);

      jest
        .spyOn(Crypto, 'randomBytes')
        .mockReturnValueOnce(recoverTokenMock as never);

      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockResolvedValueOnce(null);

      const result = await authRepository.sendRecoverPasswordEmail(
        userEmailMock,
      );

      expect(prismaService.userContactInfo.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaService.userSecurityInfo.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(recoverTokenMock);
    });

    it('should throw an error if password recover email is not sent', async () => {
      jest
        .spyOn(prismaService.userContactInfo, 'findFirst')
        .mockResolvedValueOnce(null);

      try {
        await authRepository.sendRecoverPasswordEmail(userEmailMock);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(404);
        expect(error.message).toBe('user with this email not found');
      }
    });
  });

  describe('reset password', () => {
    it('should reset user account password', async () => {
      jest
        .spyOn(prismaService.userSecurityInfo, 'findFirst')
        .mockResolvedValueOnce(getUserSecurityInfoResponse);

      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockResolvedValueOnce(null);

      const result = await authRepository.resetPassword(
        recoverTokenMock,
        userCredentialsMock.password,
      );

      expect(prismaService.userSecurityInfo.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaService.userSecurityInfo.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(resetPasswordResponse);
    });

    it('should throw an error if recover token is invalid', async () => {
      jest
        .spyOn(prismaService.userSecurityInfo, 'findFirst')
        .mockResolvedValueOnce(null);

      try {
        await authRepository.resetPassword(
          recoverTokenMock,
          userCredentialsMock.password,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(404);
        expect(error.message).toBe('invalid recover token');
      }
    });

    it('should throw an error if password not reseted', async () => {
      jest
        .spyOn(prismaService.userSecurityInfo, 'findFirst')
        .mockResolvedValueOnce(getUserSecurityInfoResponse);

      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockRejectedValueOnce('user not updated');

      try {
        await authRepository.resetPassword(
          recoverTokenMock,
          userCredentialsMock.password,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('password not reseted');
      }
    });
  });

  describe('resend confirm account token email', () => {
    it('should send an email with confirmation token', async () => {
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce(mockPrismaUpdateConfirmationToken);

      jest
        .spyOn(Crypto, 'randomBytes')
        .mockReturnValueOnce(mockConfirmationToken as never);

      const result = await authRepository.resendAccountToken(
        mockPrismaUpdateConfirmationToken.id,
        mockPrismaUpdateConfirmationToken.contact.email,
      );

      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResendAccountTokenResponse);
    });

    it('should throw an error if confirmation token not generated', async () => {
      jest.spyOn(prismaService.user, 'update').mockRejectedValueOnce(null);

      try {
        await authRepository.resendAccountToken(
          mockPrismaUpdateConfirmationToken.id,
          mockPrismaUpdateConfirmationToken.contact.email,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('Account token not generated');
      }
    });
  });
});
