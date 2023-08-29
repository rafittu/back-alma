import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { SignInService } from '../services/signin.service';
import { ConfirmAccountEmailService } from '../services/confirm-email.service';
import { RecoverPasswordService } from '../services/recover-password.service';
import {
  accessTokenMock,
  accountConfirmResponse,
  authRequestMock,
  confirmationTokenMock,
  recoverPasswordEmailResponse,
  resetPasswordMock,
  resetPasswordResponse,
  userEmailMock,
  userPayloadMock,
} from './mocks/controller.mock';
import { ResendAccountTokenEmailService } from '../services/resend-account-token.service';

describe('AuthController', () => {
  let controller: AuthController;
  let signInService: SignInService;
  let confirmAccountEmailService: ConfirmAccountEmailService;
  let recoverPasswordService: RecoverPasswordService;
  let resendAccountTokenEmailService: ResendAccountTokenEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: SignInService,
          useValue: {
            execute: jest.fn().mockResolvedValueOnce(accessTokenMock),
          },
        },
        {
          provide: ConfirmAccountEmailService,
          useValue: {
            execute: jest.fn().mockResolvedValueOnce(accountConfirmResponse),
          },
        },
        {
          provide: RecoverPasswordService,
          useValue: {
            sendRecoverPasswordEmail: jest
              .fn()
              .mockResolvedValueOnce(recoverPasswordEmailResponse),
            resetPassword: jest
              .fn()
              .mockResolvedValueOnce(resetPasswordResponse),
          },
        },
        {
          provide: ResendAccountTokenEmailService,
          useValue: {
            execute: jest.fn().mockResolvedValueOnce('email sent'),
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('user signin', () => {
    it('should return an user access token', async () => {
      const result = await controller.signIn(authRequestMock);

      expect(signInService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(accessTokenMock);
    });
  });

  describe('confirm account email', () => {
    it('should confirm user account email', async () => {
      const result = await controller.confirmAccountEmail(
        confirmationTokenMock,
      );

      expect(confirmAccountEmailService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(accountConfirmResponse);
    });
  });

  describe('send recover password email', () => {
    it('should send an email to recover password', async () => {
      const result = await controller.sendRecoverPasswordEmail(userEmailMock);

      expect(
        recoverPasswordService.sendRecoverPasswordEmail,
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual(recoverPasswordEmailResponse);
    });
  });

  describe('reset account password', () => {
    it('should reset user account password', async () => {
      const result = await controller.resetPassword(
        confirmationTokenMock,
        resetPasswordMock,
      );

      expect(recoverPasswordService.resetPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(resetPasswordResponse);
    });
  });

  describe('getMe', () => {
    it('should return the current user', () => {
      const result = controller.getMe(userPayloadMock);

      expect(result).toBe(userPayloadMock);
    });
  });

  describe('resend confirm account token email', () => {
    it('should send an email with confirmation token', async () => {
      const result = await controller.resendAccountTokenEmail(userPayloadMock);

      expect(resendAccountTokenEmailService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual('email sent');
    });
  });
});
