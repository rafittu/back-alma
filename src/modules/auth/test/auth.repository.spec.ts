import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../repository/auth.repository';
import {
  getUserCredentialsResponse,
  userCredentialsMock,
  validatedUserMockResponse,
} from './mocks/repository.mock';
import { AppError } from '../../../common/errors/Error';
import { UserStatus } from '../../user/structure/user-status.enum';
import {
  accountConfirmResponse,
  confirmationTokenMock,
} from './mocks/controller.mock';

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

  describe('confirm Account Email', () => {
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
  });
});
