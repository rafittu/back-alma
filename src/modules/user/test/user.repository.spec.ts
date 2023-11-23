import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma.service';
import { UserStatus } from '../interfaces/user-status.enum';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import { mockCreateUser, mockUpdateUserEmail } from './mocks/services.mock';
import {
  FormattedUserResponse,
  UnformattedUserResponse,
  UnformattedCreatedUser,
  FormattedCreatedUser,
  UnformattedDeletedUser,
  FormattedDeletedUserResponse,
  mockUpdateUserPassword,
  oldPasswordPrismaResponse,
} from './mocks/repository.mock';

import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MockInterfaceCreateUser, MockPrismaUser } from './mocks/user.mock';

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
        .mockResolvedValueOnce(MockPrismaUser);

      const result = await userRepository.createUser(MockInterfaceCreateUser);

      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockPrismaUser);
    });

    it('should throw an error if email or phone is already in use', async () => {
      jest.spyOn(prismaService.user, 'create').mockRejectedValueOnce({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      try {
        await userRepository.createUser(MockInterfaceCreateUser);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(409);
        expect(error.message).toBe('email already in use');
      }
    });

    it('should throw an error if user is not created', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValueOnce(
          new AppError('user-repository.createUser', 500, 'user not created'),
        );

      try {
        await userRepository.createUser(MockInterfaceCreateUser);
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

  describe('update user', () => {
    it('should update user data successfully', async () => {
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce(UnformattedUserResponse);

      const result = await userRepository.updateUser(
        mockUpdateUserEmail,
        FormattedCreatedUser.id,
      );

      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
    });

    it('should update user password successfully', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(oldPasswordPrismaResponse as unknown as User);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce(UnformattedUserResponse);

      const result = await userRepository.updateUser(
        mockUpdateUserPassword,
        FormattedCreatedUser.id,
      );

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
    });

    it('should throw an error if old password is incorrect when updating it', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(oldPasswordPrismaResponse as unknown as User);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      try {
        await userRepository.updateUser(
          mockUpdateUserPassword,
          FormattedCreatedUser.id,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(422);
        expect(error.message).toBe('old passwords do not match');
      }
    });

    it('should throw an error if new email is already taken', async () => {
      jest.spyOn(prismaService.user, 'update').mockRejectedValueOnce({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      try {
        await userRepository.updateUser(
          mockUpdateUserEmail,
          FormattedCreatedUser.id,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(409);
        expect(error.message).toBe('email already in use');
      }
    });

    it('should throw an error if user is not updated', async () => {
      jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValueOnce(
          new AppError('user-repository.updateUser', 304, 'user not updated'),
        );

      try {
        await userRepository.updateUser(
          mockUpdateUserEmail,
          FormattedCreatedUser.id,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(304);
        expect(error.message).toBe('user not updated');
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

  describe('get user by filter', () => {
    it('should get a user by id successfully', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(UnformattedUserResponse);

      const result = await userRepository.userByFilter({
        id: FormattedCreatedUser.id,
      });

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
    });

    it('should get a user by email successfully', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(UnformattedUserResponse);

      const result = await userRepository.userByFilter({
        email: FormattedCreatedUser.contact.email,
      });

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
    });

    it('should get a user by phone successfully', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(UnformattedUserResponse);

      const result = await userRepository.userByFilter({
        phone: FormattedCreatedUser.contact.phone,
      });

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FormattedUserResponse);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValueOnce(null);

      const result = await userRepository.userByFilter({
        phone: FormattedCreatedUser.contact.phone,
      });

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toEqual(null);
    });

    it('should throw an error if could not get user', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockRejectedValueOnce(
          new AppError(
            'user-repository.getUserByFilter',
            500,
            'could not get user',
          ),
        );

      try {
        await userRepository.userByFilter({
          email: FormattedCreatedUser.contact.email,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('could not get user');
      }
    });
  });
});
