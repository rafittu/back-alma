import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmAccountEmailService } from '../services/confirm-email.service';
import { RecoverPasswordService } from '../services/recover-password.service';
import { SignInService } from '../services/signin.service';
import { AuthRepository } from '../repository/auth.repository';
import { JwtService } from '@nestjs/jwt';
import {
  jwtPayloadMock,
  jwtTokenMock,
  recoverTokenMock,
  signinPayloadMock,
} from './mocks/services.mock';
import {
  accountConfirmResponse,
  recoverPasswordEmailResponse,
  userEmailMock,
} from './mocks/controller.mock';
import { confirmationTokenMock } from './mocks/controller.mock';
import { MailerService } from '@nestjs-modules/mailer';

describe('AuthService', () => {
  let signInService: SignInService;
  let jwtService: JwtService;
  let confirmAccountEmailService: ConfirmAccountEmailService;
  let recoverPasswordService: RecoverPasswordService;

  let authRepository: AuthRepository;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInService,
        JwtService,
        ConfirmAccountEmailService,
        RecoverPasswordService,
        {
          provide: AuthRepository,
          useValue: {
            validateUser: jest.fn(),
            confirmAccountEmail: jest
              .fn()
              .mockResolvedValueOnce(accountConfirmResponse),
            sendRecoverPasswordEmail: jest
              .fn()
              .mockResolvedValueOnce(recoverPasswordEmailResponse),
            resetPassword: jest.fn(),
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
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(signInService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(confirmAccountEmailService).toBeDefined();
    expect(recoverPasswordService).toBeDefined();
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
      jest
        .spyOn(authRepository, 'confirmAccountEmail')
        .mockResolvedValueOnce(accountConfirmResponse);

      const result = await confirmAccountEmailService.execute(
        confirmationTokenMock,
      );

      expect(authRepository.confirmAccountEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(accountConfirmResponse);
    });
  });

  describe('send recover password email', () => {
    it('should send an email with recover password instructions', async () => {
      jest
        .spyOn(authRepository, 'sendRecoverPasswordEmail')
        .mockResolvedValueOnce(recoverTokenMock);

      jest.spyOn(mailerService, 'sendMail').mockResolvedValueOnce('email sent');

      const result = await recoverPasswordService.sendRecoverPasswordEmail(
        userEmailMock,
      );

      expect(authRepository.sendRecoverPasswordEmail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(recoverPasswordEmailResponse);
    });
  });
});
