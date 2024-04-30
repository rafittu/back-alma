import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { SignInService } from '../services/signin.service';
import { ConfirmAccountEmailService } from '../services/confirm-email.service';
import { RecoverPasswordService } from '../services/recover-password.service';
import { ResendAccountTokenEmailService } from '../services/resend-account-token.service';
import { RefreshJwtService } from '../services/refresh-jwt.service';
import {
  MockAccessToken,
  MockAuthRequest,
  MockConfirmationToken,
  MockFakeRequest,
  MockResetPassword,
  MockUserCredentials,
  MockUserData,
  MockUserPayload,
} from './mocks/auth.mock';
import { Channel } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let signInService: SignInService;
  let confirmAccountEmailService: ConfirmAccountEmailService;
  let recoverPasswordService: RecoverPasswordService;
  let resendAccountTokenEmailService: ResendAccountTokenEmailService;
  let refreshJwtService: RefreshJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: SignInService,
          useValue: {
            execute: jest.fn().mockResolvedValueOnce(MockAccessToken),
          },
        },
        {
          provide: ConfirmAccountEmailService,
          useValue: {
            execute: jest.fn().mockResolvedValueOnce({
              message: 'account email successfully confirmed',
            }),
          },
        },
        {
          provide: RecoverPasswordService,
          useValue: {
            sendRecoverPasswordEmail: jest.fn().mockResolvedValueOnce({
              message: `recover password email sent to ${MockUserCredentials.email}`,
            }),
            resetPassword: jest
              .fn()
              .mockResolvedValueOnce({ message: 'password reseted' }),
          },
        },
        {
          provide: ResendAccountTokenEmailService,
          useValue: {
            execute: jest.fn().mockResolvedValueOnce('email sent'),
          },
        },
        {
          provide: RefreshJwtService,
          useValue: {
            execute: jest.fn().mockResolvedValueOnce(MockAccessToken),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    signInService = module.get<SignInService>(SignInService);
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('user signin', () => {
    it('should return an user accessToken and refreshToken', async () => {
      const result = await controller.signIn(MockAuthRequest);

      expect(signInService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockAccessToken);
    });
  });

  describe('confirm account email', () => {
    it('should confirm user account email', async () => {
      const result = await controller.confirmAccountEmail(
        MockFakeRequest,
        MockConfirmationToken,
      );

      const response = {
        message: 'account email successfully confirmed',
      };

      expect(confirmAccountEmailService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });
  });

  describe('send recover password email', () => {
    it('should send an email to recover password', async () => {
      const result = await controller.sendRecoverPasswordEmail({
        email: MockUserCredentials.email,
        originChannel: Channel.WOPHI,
      });

      const response = {
        message: `recover password email sent to ${MockUserCredentials.email}`,
      };

      expect(
        recoverPasswordService.sendRecoverPasswordEmail,
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });
  });

  describe('reset account password', () => {
    it('should reset user account password', async () => {
      const result = await controller.resetPassword(
        MockFakeRequest,
        MockConfirmationToken,
        MockResetPassword,
      );

      expect(recoverPasswordService.resetPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'password reseted' });
    });
  });

  describe('getMe', () => {
    it('should return the current user', () => {
      const result = controller.getMe(MockUserPayload);

      expect(result).toBe(MockUserPayload);
    });
  });

  describe('resend confirm account token email', () => {
    it('should send an email with confirmation token', async () => {
      const result = await controller.resendAccountTokenEmail(
        MockUserPayload,
        MockUserData.contact.email,
      );

      expect(resendAccountTokenEmailService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual('email sent');
    });
  });
});
