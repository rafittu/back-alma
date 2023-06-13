import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserService } from '../services/create-user.service';
import { GetUserByIdService } from '../services/get-user-by-id.service';
import { UpdateUserService } from '../services/update-user.service';
import { DeleteUserService } from '../services/delete-user.service';
import { UserRepository } from '../repository/user.repository';
import { MailerService } from '@nestjs-modules/mailer';
import {
  invalidUserId,
  mockCreateUser,
  mockUpdateAccountPassword,
  mockUpdateUserEmail,
  updatePasswordInvalidBody,
} from './mocks/services.mock';
import {
  mockDeleteUserResponse,
  mockNewUser,
  mockUpdateUser,
  mockUpdateUserResponse,
} from './mocks/controller.mock';
import { AppError } from '../../../common/errors/Error';

describe('User Services', () => {
  let createUserService: CreateUserService;
  let getUserByIdService: GetUserByIdService;
  let updateUserService: UpdateUserService;
  let deleteUserService: DeleteUserService;

  let userRepository: UserRepository;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        GetUserByIdService,
        UpdateUserService,
        DeleteUserService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn().mockResolvedValue(mockNewUser),
            getUserById: jest.fn().mockResolvedValue(mockNewUser),
            updateUser: jest.fn().mockResolvedValue(mockUpdateUserResponse),
            deleteUser: jest.fn().mockResolvedValue(mockDeleteUserResponse),
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

    createUserService = module.get<CreateUserService>(CreateUserService);
    getUserByIdService = module.get<GetUserByIdService>(GetUserByIdService);
    updateUserService = module.get<UpdateUserService>(UpdateUserService);
    deleteUserService = module.get<DeleteUserService>(DeleteUserService);

    userRepository = module.get<UserRepository>(UserRepository);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(createUserService).toBeDefined();
    expect(getUserByIdService).toBeDefined();
    expect(updateUserService).toBeDefined();
    expect(deleteUserService).toBeDefined();
  });

  describe('create user', () => {
    it('should create a new user successfully', async () => {
      const result = await createUserService.execute(mockCreateUser);

      expect(userRepository.createUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNewUser);
    });

    it('should send an email confirmation after user created', async () => {
      await createUserService.execute(mockCreateUser);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
    });

    it(`should throw an error if 'passwordConfirmation' doesnt match`, async () => {
      const invalidPasswordConfirmation = {
        ...mockCreateUser,
        passwordConfirmation: '@InvalidPassword123',
      };

      try {
        await createUserService.execute(invalidPasswordConfirmation);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(422);
        expect(error.message).toBe('passwords do not match');
      }
    });

    it(`should throw an error if 'ipAddress' is invalid`, async () => {
      const invalidIpAddress = {
        ...mockCreateUser,
        ipAddress: 'invalid ip address',
      };

      try {
        await createUserService.execute(invalidIpAddress);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(403);
        expect(error.message).toBe('invalid ip address');
      }
    });
  });

  describe('get user by id', () => {
    it('should get an user successfully', async () => {
      const result = await getUserByIdService.execute(mockNewUser.id);

      expect(userRepository.getUserById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNewUser);
    });

    it('should throw an error if user not found', async () => {
      try {
        await getUserByIdService.execute(invalidUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(404);
        expect(error.message).toBe('user not found');
      }
    });
  });

  describe('update user', () => {
    it('should update an user successfully', async () => {
      const result = await updateUserService.execute(
        mockUpdateUser,
        mockNewUser.id,
      );

      expect(userRepository.updateUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdateUserResponse);
    });

    it('should send an email confirmation if updating user email', async () => {
      await updateUserService.execute(mockUpdateUserEmail, mockNewUser.id);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
    });

    it(`should throw an error if doesn't contain 'oldPassword' field when updating password`, async () => {
      try {
        await updateUserService.execute(
          updatePasswordInvalidBody,
          mockNewUser.id,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(422);
        expect(error.message).toBe(`missing 'oldPassword' field`);
      }
    });

    it(`should throw an error if 'newPassword' and 'passwordConfirmation' doesn't match`, async () => {
      try {
        await updateUserService.execute(
          mockUpdateAccountPassword,
          mockNewUser.id,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(422);
        expect(error.message).toBe('new passwords do not match');
      }
    });
  });

  describe('delete user', () => {
    it('should delete an user successfully', async () => {
      const result = await deleteUserService.execute(mockNewUser.id);

      expect(userRepository.deleteUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeleteUserResponse);
    });

    it('should throw an error if user not cancelled', async () => {
      jest
        .spyOn(userRepository, 'deleteUser')
        .mockRejectedValueOnce(
          new AppError('user-repository.deleteUser', 500, 'user not cancelled'),
        );

      try {
        await deleteUserService.execute(invalidUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('user not cancelled');
      }
    });
  });
});
