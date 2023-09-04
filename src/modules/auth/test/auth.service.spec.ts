import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmAccountEmailService } from '../services/confirm-email.service';
import { RecoverPasswordService } from '../services/recover-password.service';
import { SignInService } from '../services/signin.service';
import { AuthRepository } from '../repository/auth.repository';
import { JwtService } from '@nestjs/jwt';
import {
  jwtPayloadMock,
  jwtTokenMock,
  mockResendAccountTokenResponse,
  mockUser,
  recoverTokenMock,
  signinPayloadMock,
} from './mocks/services.mock';
import {
  accountConfirmResponse,
  recoverPasswordEmailResponse,
  resetPasswordMock,
  resetPasswordResponse,
  userEmailMock,
} from './mocks/controller.mock';
import { confirmationTokenMock } from './mocks/controller.mock';
import { MailerService } from '@nestjs-modules/mailer';
import { AppError } from '../../../common/errors/Error';
import { ResendAccountTokenEmailService } from '../services/resend-account-token.service';
import { UserRepository } from '../../../modules/user/repository/user.repository';

describe('AuthService', () => {
  let signInService: SignInService;
  let jwtService: JwtService;
  let confirmAccountEmailService: ConfirmAccountEmailService;
  let recoverPasswordService: RecoverPasswordService;
  let resendAccountTokenEmailService: ResendAccountTokenEmailService;

  let authRepository: AuthRepository;
  let userRepository: UserRepository;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInService,
        JwtService,
        ConfirmAccountEmailService,
        RecoverPasswordService,
        ResendAccountTokenEmailService,
        {
          provide: AuthRepository,
          useValue: {
            confirmAccountEmail: jest
              .fn()
              .mockResolvedValueOnce(accountConfirmResponse),
            sendRecoverPasswordEmail: jest
              .fn()
              .mockResolvedValueOnce(recoverTokenMock),
            resetPassword: jest
              .fn()
              .mockResolvedValueOnce(resetPasswordResponse),
            resendAccountToken: jest
              .fn()
              .mockResolvedValueOnce(mockResendAccountTokenResponse),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            userByFilter: jest.fn().mockResolvedValueOnce(mockUser),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValueOnce('email sent'),
          },
        },
      ],
    }).compile();

    authRepository = module.get<AuthRepository>(AuthRepository);
    userRepository = module.get<UserRepository>(UserRepository);
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
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(signInService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(confirmAccountEmailService).toBeDefined();
    expect(recoverPasswordService).toBeDefined();
    expect(resendAccountTokenEmailService).toBeDefined();
  });

  describe('signin', () => {
    it('should return a user token', () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(jwtTokenMock);

      const result = signInService.execute(signinPayloadMock);

      expect(jwtService.sign).toHaveBeenCalledWith(jwtPayloadMock);
      expect(result).toEqual({ accessToken: jwtTokenMock });
    });
  });

  describe('confirm email account', () => {
    it('should confirm user account email', async () => {
      const result = await confirmAccountEmailService.execute(
        confirmationTokenMock,
      );

      expect(authRepository.confirmAccountEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(accountConfirmResponse);
    });
  });

  describe('send recover password email', () => {
    it('should send an email with recover password instructions', async () => {
      const result = await recoverPasswordService.sendRecoverPasswordEmail(
        userEmailMock,
      );

      expect(authRepository.sendRecoverPasswordEmail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(recoverPasswordEmailResponse);
    });
  });

  describe('reset account password', () => {
    it('should reset account password to a new one', async () => {
      const result = await recoverPasswordService.resetPassword(
        recoverTokenMock,
        resetPasswordMock,
      );

      expect(authRepository.resetPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(resetPasswordResponse);
    });

    it('should throw an error if passwordConfirmation is incorrect', async () => {
      resetPasswordMock.passwordConfirmation = 'invalidPasswordConfirmation';

      try {
        await recoverPasswordService.resetPassword(
          recoverTokenMock,
          resetPasswordMock,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('passwords do not match');
      }
    });
  });

  describe('resend confirm account token email', () => {
    it('should send an email with confirmation token', async () => {
      const result = await resendAccountTokenEmailService.execute(
        signinPayloadMock.id,
        signinPayloadMock.email,
      );

      const response = {
        message: `account confirmation token resent to ${signinPayloadMock.email}`,
      };

      expect(authRepository.resendAccountToken).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });

    it('should throw an error if missing request body parameter', async () => {
      try {
        await resendAccountTokenEmailService.execute(
          signinPayloadMock.id,
          null,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('Missing email parameter in request body');
      }
    });
  });
});
