import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma.service';
import { UserStatus } from '../structure/user-status.enum';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import {
  mockCreateUser,
  mockUpdateAccountPassword,
} from './mocks/services.mock';
import {
  UnformattedUserPrismaResponse,
  FormattedUserResponse,
} from './mocks/repository.mock';
import { mockNewUser, mockUpdateUserResponse } from './mocks/controller.mock';
import bcrypt from 'bcrypt';

describe('User Repository', () => {
  let userRepository: UserRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository, PrismaService],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create user', () => {
    it('should create a new user successfully', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValueOnce(UnformattedUserPrismaResponse);

      const result = await userRepository.createUser(
        mockCreateUser,
        UserStatus.ACTIVE,
      );

      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
    });

    it('should throw an error if username or email is already in use', async () => {
      jest.spyOn(prismaService.user, 'create').mockRejectedValueOnce({
        code: 'P2002',
        meta: { target: ['username'] },
      });

      try {
        await userRepository.createUser(mockCreateUser, UserStatus.ACTIVE);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(409);
        expect(error.message).toBe('username already in use');
      }
    });

    it('should throw an error if user is not created', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValueOnce(new Error());

      try {
        await userRepository.createUser(mockCreateUser, UserStatus.ACTIVE);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('user not created');
      }
    });
  });

  describe('get user by id', () => {
    it('should get a user by id successfully', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(UnformattedUserPrismaResponse);

      const result = await userRepository.getUserById(mockNewUser.id);

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
    });

    it('should throw an error if user is not found', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockRejectedValueOnce(new Error());

      try {
        await userRepository.getUserById(mockNewUser.id);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(404);
        expect(error.message).toBe('user not found');
      }
    });
  });

  describe('delete user', () => {
    it('should delete a user successfully', async () => {
      UnformattedUserPrismaResponse.security.status = UserStatus.CANCELLED;

      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce(UnformattedUserPrismaResponse);

      const result = await userRepository.deleteUser(
        mockNewUser.id,
        UserStatus.CANCELLED,
      );

      FormattedUserResponse.security.status = UserStatus.CANCELLED;

      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
      expect(result.security.status).toContain('CANCELLED');
    });

    it('should throw an error if user deletion fails', async () => {
      jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValueOnce(new Error());

      try {
        await userRepository.deleteUser(mockNewUser.id, UserStatus.CANCELLED);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('user not cancelled');
      }
    });
  });
});
