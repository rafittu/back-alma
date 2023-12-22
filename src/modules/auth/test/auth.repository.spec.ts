import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma.service';
import { AuthRepository } from '../repository/auth.repository';
import { AppError } from '../../../common/errors/Error';
import { UserStatus } from '../../user/interfaces/user-status.enum';
import {
  MockConfirmationToken,
  MockUser,
  MockUserCredentials,
  MockUserData,
  MockUserPayload,
  MockUserSecurityInfo,
} from './mocks/auth.mock';
import { Channel } from '@prisma/client';
import { SecurityService } from '../../../common/services/security.service';

describe('Auth Repository', () => {
  let authRepository: AuthRepository;
  let prismaService: PrismaService;
  let securityService: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRepository, PrismaService, SecurityService],
    }).compile();

    authRepository = module.get<AuthRepository>(AuthRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    securityService = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(authRepository).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(securityService).toBeDefined();
  });

  describe('validate user', () => {
    it('should validate user credentials successfully', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(MockUserData);

      jest
        .spyOn(securityService, 'comparePasswords')
        .mockResolvedValue(true as never);

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
        .spyOn(securityService, 'generateRandomToken')
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

    it('should throw an error if account not confirmed', async () => {
      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockRejectedValueOnce('invalid confirmation token');

      try {
        await authRepository.confirmAccountEmail(
          MockConfirmationToken,
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
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(MockUser);

      jest
        .spyOn(securityService, 'generateRandomToken')
        .mockReturnValueOnce(MockConfirmationToken as never);

      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockResolvedValueOnce(null);

      const result = await authRepository.sendRecoverPasswordEmail(
        MockUserCredentials.email,
      );

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaService.userSecurityInfo.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockConfirmationToken);
    });

    it('should throw an error if password recover email is not sent', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValueOnce(null);

      try {
        await authRepository.sendRecoverPasswordEmail(
          MockUserCredentials.email,
        );
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
        .mockResolvedValueOnce(MockUserSecurityInfo);

      jest.spyOn(securityService, 'hashPassword').mockResolvedValueOnce({
        hashedPassword: 'mockHashedPassword',
        salt: 'mockSalt',
      });

      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockResolvedValueOnce(null);

      const result = await authRepository.resetPassword(
        MockConfirmationToken,
        MockUserCredentials.password,
      );

      const response = { message: 'password reseted' };

      expect(prismaService.userSecurityInfo.findFirst).toHaveBeenCalledTimes(1);
      expect(securityService.hashPassword).toHaveBeenCalledTimes(1);
      expect(prismaService.userSecurityInfo.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });

    it('should throw an error if recover token is invalid', async () => {
      jest
        .spyOn(prismaService.userSecurityInfo, 'findFirst')
        .mockResolvedValueOnce(null);

      try {
        await authRepository.resetPassword(
          MockConfirmationToken,
          MockUserCredentials.password,
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
        .mockResolvedValueOnce(MockUserSecurityInfo);

      jest.spyOn(securityService, 'hashPassword').mockResolvedValueOnce({
        hashedPassword: 'mockHashedPassword',
        salt: 'mockSalt',
      });

      jest
        .spyOn(prismaService.userSecurityInfo, 'update')
        .mockRejectedValueOnce('user not updated');

      try {
        await authRepository.resetPassword(
          MockConfirmationToken,
          MockUserCredentials.password,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('password not reseted');
      }
    });
  });
});
