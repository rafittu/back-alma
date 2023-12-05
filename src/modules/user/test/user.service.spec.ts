import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserService } from '../services/create-user.service';
import { GetUserByIdService } from '../services/get-user-by-id.service';
import { UpdateUserService } from '../services/update-user.service';
import { DeleteUserService } from '../services/delete-user.service';
import { UserRepository } from '../repository/user.repository';
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
import { GetUserByFilterService } from '../services/user-by-filter.service';
import {
  MockCreateUserDto,
  MockIUser,
  MockIpAddress,
  MockPrismaUser,
  MockUpdateUserDto,
  MockUser,
  MockUserData,
} from './mocks/user.mock';
import { PasswordService } from '../services/password.service';
import { EmailService } from '../services/email.service';
import { RedisCacheService } from '../../../modules/auth/infra/redis/redis-cache.service';
import { Channel } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';

describe('User Services', () => {
  let createUserService: CreateUserService;
  let getUserByIdService: GetUserByIdService;
  let updateUserService: UpdateUserService;
  let deleteUserService: DeleteUserService;
  let getUserByFilterService: GetUserByFilterService;
  let passwordService: PasswordService;
  let emailService: EmailService;
  let redisCacheService: RedisCacheService;

  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        GetUserByIdService,
        UpdateUserService,
        DeleteUserService,
        GetUserByFilterService,
        {
          provide: PasswordService,
          useValue: {
            hashPassword: jest.fn().mockResolvedValueOnce('hashed_password'),
            generateRandomToken: jest
              .fn()
              .mockResolvedValueOnce('random_token'),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendConfirmationEmail: jest.fn(),
          },
        },
        {
          provide: RedisCacheService,
          useValue: {
            set: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn().mockResolvedValue(MockUser),
            createAccessToAdditionalChannel: jest.fn().mockResolvedValue(null),
            userByFilter: jest.fn().mockResolvedValue(MockPrismaUser),
            getUserById: jest.fn().mockResolvedValue(MockPrismaUser),
            updateUser: jest.fn().mockResolvedValue(MockPrismaUser),
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
    getUserByFilterService = module.get<GetUserByFilterService>(
      GetUserByFilterService,
    );
    passwordService = module.get<PasswordService>(PasswordService);
    emailService = module.get<EmailService>(EmailService);
    redisCacheService = module.get<RedisCacheService>(RedisCacheService);

    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    MockCreateUserDto.passwordConfirmation = MockCreateUserDto.password;

    MockIUser.personal.updatedAt = MockPrismaUser.updated_at;
    MockIUser.contact.updatedAt = MockPrismaUser.updated_at;
    MockIUser.security.updatedAt = MockPrismaUser.updated_at;
  });

  it('should be defined', () => {
    expect(createUserService).toBeDefined();
    expect(getUserByIdService).toBeDefined();
    expect(updateUserService).toBeDefined();
    expect(deleteUserService).toBeDefined();
    expect(getUserByFilterService).toBeDefined();
    expect(emailService).toBeDefined();
    expect(redisCacheService).toBeDefined();
  });

  describe('create user', () => {
    it('should create a new user successfully', async () => {
      jest.spyOn(createUserService as any, 'validateIpAddress');
      jest.spyOn(createUserService as any, 'formatSecurityInfo');
      jest.spyOn(createUserService as any, 'mapUserToReturn');

      const result = await createUserService.execute(
        MockCreateUserDto,
        MockIpAddress,
      );

      delete MockIUser.personal.updatedAt;
      delete MockIUser.contact.updatedAt;
      delete MockIUser.security.updatedAt;

      expect(createUserService['validateIpAddress']).toHaveBeenCalledTimes(1);
      expect(createUserService['formatSecurityInfo']).toHaveBeenCalledTimes(1);
      expect(userRepository.createUser).toHaveBeenCalledTimes(1);
      expect(createUserService['mapUserToReturn']).toHaveBeenCalledTimes(1);
      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    it('should create access to new channel successfully', async () => {
      jest
        .spyOn(userRepository, 'userByFilter')
        .mockResolvedValueOnce(MockUserData);

      MockUserData.allowed_channels = [Channel.MIAU];

      try {
        await createUserService.execute(MockCreateUserDto, MockIpAddress);
      } catch (error) {
        expect(passwordService.generateRandomToken).toHaveBeenCalledTimes(1);
        expect(
          userRepository.createAccessToAdditionalChannel,
        ).toHaveBeenCalledTimes(1);
        expect(redisCacheService.set).toHaveBeenCalledTimes(1);
        expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
      }
    });

    it('should throw an error if access to new channel is not created', async () => {
      jest
        .spyOn(userRepository, 'userByFilter')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(MockUserData);

      jest.spyOn(redisCacheService, 'set').mockRejectedValueOnce(new Error());

      try {
        await createUserService.execute(MockCreateUserDto, MockIpAddress);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('failed to create access to new channel');
      }
    });

    it(`should throw an error if 'ipAddress' is invalid`, async () => {
      const invalidIpAddress = 'invalid_ip_address';

      try {
        await createUserService.execute(MockCreateUserDto, invalidIpAddress);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(403);
        expect(error.message).toBe('invalid ip address');
      }
    });

    it(`should throw an error if 'passwordConfirmation' doesnt match`, async () => {
      const invalidPasswordConfirmation = 'invalid_password_confirmation';
      const newBodyRequest = {
        ...MockCreateUserDto,
        passwordConfirmation: invalidPasswordConfirmation,
      };

      try {
        await createUserService.execute(newBodyRequest, MockIpAddress);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(422);
        expect(error.message).toBe('passwords do not match');
      }
    });

    it('should throw an error if user not created', async () => {
      jest
        .spyOn(userRepository, 'createUser')
        .mockRejectedValueOnce(new Error());

      try {
        await createUserService.execute(MockCreateUserDto, MockIpAddress);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('failed to create user');
      }
    });

    it('should throw an AppError', async () => {
      jest
        .spyOn(userRepository, 'createUser')
        .mockRejectedValueOnce(
          new AppError('error_message', 500, 'error_description'),
        );

      try {
        await createUserService.execute(MockCreateUserDto, MockIpAddress);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('error_description');
      }
    });
  });

  describe('get user by filter', () => {
    it('should get by email successfully', async () => {
      const result = await getUserByFilterService.execute({
        email: MockUserData.contact.email,
      });

      expect(userRepository.userByFilter).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });
  });

  describe('get user by id', () => {
    it('should get an user successfully', async () => {
      const result = await getUserByIdService.execute(MockUserData.id);

      expect(userRepository.getUserById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    it('should throw an error if user not found', async () => {
      try {
        await getUserByIdService.execute('invalid_id');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(404);
        expect(error.message).toBe('user not found');
      }
    });
  });

  describe('update user', () => {
    it('should update user data successfully', async () => {
      jest.spyOn(updateUserService as any, 'validateIpAddress');
      jest.spyOn(updateUserService as any, 'validatePassword');

      const result = await updateUserService.execute(
        MockUpdateUserDto,
        MockUser.id,
        MockIpAddress,
      );

      expect(updateUserService['validateIpAddress']).toHaveBeenCalledTimes(1);
      expect(updateUserService['validatePassword']).toHaveBeenCalledTimes(1);
      expect(userRepository.updateUser).toHaveBeenCalledTimes(1);
      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    // it('should send an email confirmation if updating user email', async () => {
    //   await updateUserService.execute(mockUpdateUserEmail, mockNewUser.id);

    //   expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
    // });

    // it(`should throw an error if doesn't contain 'oldPassword' field when updating password`, async () => {
    //   try {
    //     await updateUserService.execute(
    //       updatePasswordInvalidBody,
    //       mockNewUser.id,
    //     );
    //   } catch (error) {
    //     expect(error).toBeInstanceOf(AppError);
    //     expect(error.code).toBe(422);
    //     expect(error.message).toBe(`missing 'oldPassword' field`);
    //   }
    // });

    // it(`should throw an error if 'newPassword' and 'passwordConfirmation' doesn't match`, async () => {
    //   try {
    //     await updateUserService.execute(
    //       mockUpdateAccountPassword,
    //       mockNewUser.id,
    //     );
    //   } catch (error) {
    //     expect(error).toBeInstanceOf(AppError);
    //     expect(error.code).toBe(422);
    //     expect(error.message).toBe('new passwords do not match');
    //   }
    // });
  });

  // describe('delete user', () => {
  //   it('should delete an user successfully', async () => {
  //     const result = await deleteUserService.execute(mockNewUser.id);

  //     expect(userRepository.deleteUser).toHaveBeenCalledTimes(1);
  //     expect(result).toEqual(mockDeleteUserResponse);
  //   });

  //   it('should throw an error if user not cancelled', async () => {
  //     jest
  //       .spyOn(userRepository, 'deleteUser')
  //       .mockRejectedValueOnce(
  //         new AppError('user-repository.deleteUser', 500, 'user not cancelled'),
  //       );

  //     try {
  //       await deleteUserService.execute(invalidUserId);
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(AppError);
  //       expect(error.code).toBe(500);
  //       expect(error.message).toBe('user not cancelled');
  //     }
  //   });
  // });
});
