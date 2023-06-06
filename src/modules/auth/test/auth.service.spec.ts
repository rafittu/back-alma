import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmAccountEmailService } from '../services/confirm-email.service';
import { RecoverPasswordService } from '../services/recover-password.service';
import { SignInService } from '../services/signin.service';
import { AuthRepository } from '../repository/auth.repository';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let signInService: SignInService;
  let jwtService: JwtService;
  let confirmAccountEmailService: ConfirmAccountEmailService;
  let recoverPasswordService: RecoverPasswordService;

  let authRepository: AuthRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInService,
        JwtService,
        ConfirmAccountEmailService,
        {
          provide: RecoverPasswordService,
          useValue: {
            sendRecoverPasswordEmail: jest.fn(),

            resetPassword: jest.fn(),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            validateUser: jest.fn(),
            confirmAccountEmail: jest.fn(),
            sendRecoverPasswordEmail: jest.fn(),
            resetPassword: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(signInService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(confirmAccountEmailService).toBeDefined();
    expect(recoverPasswordService).toBeDefined();
  });
});
