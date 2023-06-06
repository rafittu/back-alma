import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../repository/auth.repository';
import {
  getUserCredentialsResponse,
  userCredentialsMock,
  validatedUserMockResponse,
} from './mocks/repository.mock';

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
  });
});
