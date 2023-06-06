import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { SignInService } from '../services/signin.service';
import { ConfirmAccountEmailService } from '../services/confirm-email.service';
import { RecoverPasswordService } from '../services/recover-password.service';

describe('AuthController', () => {
  let controller: AuthController;
  let signInService: SignInService;
  let confirmAccountEmailService: ConfirmAccountEmailService;
  let recoverPasswordService: RecoverPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: SignInService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ConfirmAccountEmailService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RecoverPasswordService,
          useValue: {
            sendRecoverPasswordEmail: jest.fn(),
            resetPassword: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
