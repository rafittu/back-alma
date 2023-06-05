import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma.service';
import { UserStatus } from '../structure/user-status.enum';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import { mockCreateUser } from './mocks/services.mock';
import {
  FormattedUserResponse,
  UnformattedUserResponse,
  UnformattedCreatedUser,
  FormattedCreatedUser,
  UnformattedDeletedUser,
  FormattedDeletedUserResponse,
} from './mocks/repository.mock';

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
        .mockResolvedValueOnce(UnformattedCreatedUser);

      const result = await userRepository.createUser(
        mockCreateUser,
        UserStatus.PENDING_CONFIRMATION,
      );

      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedCreatedUser);
    });

    it('should throw an error if username or email is already in use', async () => {
      jest.spyOn(prismaService.user, 'create').mockRejectedValueOnce({
        code: 'P2002',
        meta: { target: ['username'] },
      });

      try {
        await userRepository.createUser(
          mockCreateUser,
          UserStatus.PENDING_CONFIRMATION,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(409);
        expect(error.message).toBe('username already in use');
      }
    });

    it('should throw an error if user is not created', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValueOnce(
          new AppError('user-repository.createUser', 500, 'user not created'),
        );

      try {
        await userRepository.createUser(
          mockCreateUser,
          UserStatus.PENDING_CONFIRMATION,
        );
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
        .mockResolvedValueOnce(UnformattedUserResponse);

      const result = await userRepository.getUserById(FormattedCreatedUser.id);

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
    });

    it('should throw an error if user is not found', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockRejectedValueOnce(
          new AppError('user-repository.getUserById', 404, 'user not found'),
        );

      try {
        await userRepository.getUserById(FormattedCreatedUser.id);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(404);
        expect(error.message).toBe('user not found');
      }
    });
  });

  describe('delete user', () => {
    it('should delete a user successfully', async () => {
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce(UnformattedDeletedUser);

      const result = await userRepository.deleteUser(
        FormattedCreatedUser.id,
        UserStatus.CANCELLED,
      );

      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedDeletedUserResponse);
    });

    it('should throw an error if user deletion fails', async () => {
      jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValueOnce(
          new AppError('user-repository.deleteUser', 500, 'user not cancelled'),
        );

      try {
        await userRepository.deleteUser(
          FormattedCreatedUser.id,
          UserStatus.CANCELLED,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('user not cancelled');
      }
    });
  });
});
