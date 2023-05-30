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
} from './mocks/repository.mock';

describe('User Repository', () => {
  let userRepository: UserRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const prismaServiceMock = {
      user: {
        create: jest.fn().mockResolvedValueOnce(UnformattedCreatedUser),
        findFirst: jest.fn().mockResolvedValueOnce(UnformattedUserResponse),
        update: jest.fn().mockResolvedValueOnce(UnformattedUserResponse),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create user', () => {
    it('should create a new user successfully', async () => {
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
        const result = await userRepository.createUser(
          mockCreateUser,
          UserStatus.PENDING_CONFIRMATION,
        );

        expect(prismaService.user.create).toHaveBeenCalledTimes(1);

        console.log(
          'should throw an error if username or email is already in use',
          prismaService.user.create,
        );

        console.log('L78: não caiu no erro', result);
      } catch (error) {
        console.log('L80:', error);
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
      const result = await userRepository.getUserById(FormattedCreatedUser.id);

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
    });

    it('should throw an error if user is not found', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockRejectedValueOnce(new Error());

      try {
        const result = await userRepository.getUserById(
          FormattedCreatedUser.id,
        );
        expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);

        console.log(
          'L125: should throw an error if user is not found',
          prismaService.user.create,
        );

        console.log('não caiu no erro', result);
      } catch (error) {
        console.log('L131:', error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(404);
        expect(error.message).toBe('user not found');
      }
    });
  });

  describe('delete user', () => {
    it('should delete a user successfully', async () => {
      const result = await userRepository.deleteUser(
        FormattedCreatedUser.id,
        UserStatus.CANCELLED,
      );

      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
    });

    it('should throw an error if user deletion fails', async () => {
      jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValueOnce(new Error());

      try {
        await userRepository.deleteUser(
          FormattedCreatedUser.id,
          UserStatus.CANCELLED,
        );

        console.log('user not cancelled - Tcoverage');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('user not cancelled');
      }
    });
  });
});
