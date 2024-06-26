import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmAccountEmailService } from '../services/confirm-email.service';
import { RecoverPasswordService } from '../services/recover-password.service';
import { SignInService } from '../services/signin.service';
import { AuthRepository } from '../repository/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { AppError } from '../../../common/errors/Error';
import { ResendAccountTokenEmailService } from '../services/resend-account-token.service';
import { UserRepository } from '../../../modules/user/repository/user.repository';
import {
  MockConfirmationToken,
  MockIpAddress,
  MockJWT,
  MockRefreshJWT,
  MockResetPassword,
  MockUserByToken,
  MockUserCredentials,
  MockUserData,
  MockUserPayload,
} from './mocks/auth.mock';
import { RedisCacheService } from '../../../common/redis/redis-cache.service';
import { EmailService } from '../../../common/services/email.service';
import { SecurityService } from '../../../common/services/security.service';
import { Channel } from '@prisma/client';
import { RefreshJwtService } from '../services/refresh-jwt.service';

describe('AuthService', () => {
  let signInService: SignInService;
  let jwtService: JwtService;
  let confirmAccountEmailService: ConfirmAccountEmailService;
  let recoverPasswordService: RecoverPasswordService;
  let resendAccountTokenEmailService: ResendAccountTokenEmailService;
  let refreshJwtService: RefreshJwtService;

  let authRepository: AuthRepository;
  let emailService: EmailService;
  let redisService: RedisCacheService;
  let securityService: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInService,
        JwtService,
        ConfirmAccountEmailService,
        RecoverPasswordService,
        ResendAccountTokenEmailService,
        RedisCacheService,
        EmailService,
        SecurityService,
        RefreshJwtService,
        {
          provide: AuthRepository,
          useValue: {
            confirmAccountEmail: jest.fn().mockResolvedValueOnce({
              message: 'account email successfully confirmed',
            }),
            sendRecoverPasswordEmail: jest
              .fn()
              .mockResolvedValueOnce(MockConfirmationToken),
            resetPassword: jest
              .fn()
              .mockResolvedValueOnce({ message: 'password reseted' }),
            resendAccountToken: jest.fn().mockResolvedValueOnce({
              message: `account confirmation token resent to ${MockUserData.contact.email}`,
            }),
            validateChannel: jest.fn().mockResolvedValueOnce(null),
            findUserByToken: jest.fn().mockResolvedValueOnce(MockUserByToken),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            userByFilter: jest.fn().mockResolvedValueOnce(MockUserData),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    authRepository = module.get<AuthRepository>(AuthRepository);
    signInService = module.get<SignInService>(SignInService);
    jwtService = module.get<JwtService>(JwtService);
    confirmAccountEmailService = module.get<ConfirmAccountEmailService>(
      ConfirmAccountEmailService,
    );
    recoverPasswordService = module.get<RecoverPasswordService>(
      RecoverPasswordService,
    );
    resendAccountTokenEmailService = module.get<ResendAccountTokenEmailService>(
      ResendAccountTokenEmailService,
    );
    refreshJwtService = module.get<RefreshJwtService>(RefreshJwtService);
    emailService = module.get<EmailService>(EmailService);
    redisService = module.get<RedisCacheService>(RedisCacheService);
    securityService = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(signInService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(confirmAccountEmailService).toBeDefined();
    expect(recoverPasswordService).toBeDefined();
    expect(resendAccountTokenEmailService).toBeDefined();
    expect(refreshJwtService).toBeDefined();
    expect(emailService).toBeDefined();
    expect(redisService).toBeDefined();
  });

  describe('signin', () => {
    it('should return a user access token', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(MockJWT);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(MockRefreshJWT);

      const originChannel = Channel.WOPHI;

      const result = await signInService.execute(
        MockUserPayload,
        originChannel,
      );

      expect(authRepository.validateChannel).toHaveBeenCalledTimes(1);
      expect(authRepository.validateChannel).toHaveBeenCalledWith(
        MockUserPayload.id,
        originChannel,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: MockJWT,
        refreshToken: MockRefreshJWT,
      });
    });

    it('should throw an error', async () => {
      jest
        .spyOn(authRepository, 'validateChannel')
        .mockRejectedValueOnce(new Error());

      const originChannel = Channel.WOPHI;

      try {
        await signInService.execute(MockUserPayload, originChannel);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('resend confirm account token email', () => {
    it('should send an email with confirmation token', async () => {
      jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValueOnce();

      const result = await resendAccountTokenEmailService.execute(
        MockUserData.id,
        MockUserData.contact.email,
      );
      const response = {
        message: `account confirmation token resent to ${MockUserData.contact.email}`,
      };

      expect(authRepository.resendAccountToken).toHaveBeenCalledTimes(1);
      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });

    it('should throw an error if missing request body parameter', async () => {
      try {
        await resendAccountTokenEmailService.execute(MockUserData.id, null);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('Missing email parameter in request body');
      }
    });

    it('should throw an error if new email provided is already in user', async () => {
      const anotherUserId = 'user-id';

      try {
        await resendAccountTokenEmailService.execute(
          anotherUserId,
          MockUserData.contact.email,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('new email provided is already in use');
      }
    });

    it('should throw an error if account confirmation email is not resend', async () => {
      jest
        .spyOn(emailService, 'sendConfirmationEmail')
        .mockRejectedValueOnce(new Error('Email not sent'));

      try {
        await resendAccountTokenEmailService.execute(
          MockUserData.id,
          MockUserData.contact.email,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe(
          'failed to resend account confirmation token',
        );
      }
    });
  });

  describe('confirm email account', () => {
    it('should confirm user account email', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);
      jest.spyOn(securityService, 'isTokenValid').mockReturnValueOnce(true);

      const result = await confirmAccountEmailService.execute(
        MockConfirmationToken,
        MockIpAddress,
      );

      const response = {
        message: 'account email successfully confirmed',
      };

      expect(authRepository.confirmAccountEmail).toHaveBeenCalledTimes(1);
      expect(redisService.get).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });

    it(`should throw an error if 'ipAddress' is invalid`, async () => {
      const invalidIpAddress = 'invalid_ip_address';

      try {
        await confirmAccountEmailService.execute(
          MockConfirmationToken,
          invalidIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(403);
        expect(error.message).toBe('invalid ip address');
      }
    });

    it('should throw an error if token is expired or invalid', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);

      jest.spyOn(securityService, 'isTokenValid').mockReturnValueOnce(false);

      try {
        await confirmAccountEmailService.execute(
          MockConfirmationToken,
          MockIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('invalid or expired token');
      }
    });
  });

  describe('send recover password email', () => {
    it('should send an email with recover password instructions', async () => {
      jest
        .spyOn(emailService, 'sendRecoverPasswordEmail')
        .mockResolvedValueOnce(null);

      const result = await recoverPasswordService.sendRecoverPasswordEmail({
        email: MockUserCredentials.email,
        originChannel: Channel.WOPHI,
      });

      const response = {
        message: `recover password email sent to ${MockUserCredentials.email}`,
      };

      expect(authRepository.sendRecoverPasswordEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendRecoverPasswordEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });
  });

  describe('reset account password', () => {
    it('should reset account password to a new one', async () => {
      const result = await recoverPasswordService.resetPassword(
        MockConfirmationToken,
        MockResetPassword,
        MockIpAddress,
      );

      const response = { message: 'password reseted' };

      expect(authRepository.resetPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });

    it(`should throw an error if 'ipAddress' is invalid`, async () => {
      const invalidIpAddress = 'invalid_ip_address';

      try {
        await recoverPasswordService.resetPassword(
          MockConfirmationToken,
          MockResetPassword,
          invalidIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(403);
        expect(error.message).toBe('invalid ip address');
      }
    });

    it('should throw an error if passwordConfirmation is incorrect', async () => {
      const invalidPasswordConfirmation = {
        password: MockResetPassword.password,
        passwordConfirmation: 'invalidPasswordConfirmation',
      };

      try {
        await recoverPasswordService.resetPassword(
          MockConfirmationToken,
          invalidPasswordConfirmation,
          MockIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('passwords do not match');
      }
    });

    it('should throw an error if token is expired or invalid', async () => {
      jest.spyOn(securityService, 'isTokenValid').mockReturnValueOnce(false);

      try {
        await recoverPasswordService.resetPassword(
          MockConfirmationToken,
          MockResetPassword,
          MockIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('invalid or expired token');
      }
    });
  });

  describe('refresh token', () => {
    it('should refresh accessToken and return it', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(MockJWT);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(MockRefreshJWT);

      const originChannel = Channel.WOPHI;

      const result = await refreshJwtService.execute(
        MockUserPayload,
        originChannel,
      );

      expect(authRepository.validateChannel).toHaveBeenCalledTimes(1);
      expect(authRepository.validateChannel).toHaveBeenCalledWith(
        MockUserPayload.id,
        originChannel,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: MockJWT,
        refreshToken: MockRefreshJWT,
      });
    });

    it('should throw an error', async () => {
      jest
        .spyOn(authRepository, 'validateChannel')
        .mockRejectedValueOnce(new Error());

      const originChannel = Channel.WOPHI;

      try {
        await refreshJwtService.execute(MockUserPayload, originChannel);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
