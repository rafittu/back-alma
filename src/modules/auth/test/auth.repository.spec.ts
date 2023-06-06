import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma.service';
import { AppError } from '../../../common/errors/Error';

import { User } from '@prisma/client';
import { AuthRepository } from '../repository/auth.repository';

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
});
