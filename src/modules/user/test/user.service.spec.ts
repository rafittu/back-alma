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
import { GetUserByFilterService } from '../services/user-by-filter.service';
import {
  MockCreateUserDto,
  MockIUser,
  MockIpAddress,
  MockPrismaUser,
  MockUser,
  MockUserData,
} from './mocks/user.mock';
import { PasswordService } from '../services/password.service';
import { EmailService } from '../services/email.service';

describe('User Services', () => {
  let createUserService: CreateUserService;
  let getUserByIdService: GetUserByIdService;
  let updateUserService: UpdateUserService;
  let deleteUserService: DeleteUserService;
  let getUserByFilterService: GetUserByFilterService;
  let passwordService: PasswordService;
  let emailService: EmailService;

  let userRepository: UserRepository;
  // let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        GetUserByIdService,
        UpdateUserService,
        DeleteUserService,
        GetUserByFilterService,
        PasswordService,
        EmailService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn().mockResolvedValue(MockUser),
            userByFilter: jest.fn().mockResolvedValue(MockPrismaUser),
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
    getUserByFilterService = module.get<GetUserByFilterService>(
      GetUserByFilterService,
    );
    passwordService = module.get<PasswordService>(PasswordService);
    emailService = module.get<EmailService>(EmailService);

    userRepository = module.get<UserRepository>(UserRepository);
    // mailerService = module.get<MailerService>(MailerService);
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
  });

  describe('create user', () => {
    it('should create a new user successfully', async () => {
      jest.spyOn(createUserService as any, 'validateIpAddress');
      jest.spyOn(createUserService as any, 'formatSecurityInfo');
      jest.spyOn(createUserService as any, 'mapUserToReturn');
      jest.spyOn(emailService, 'sendConfirmationEmail');

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

    // it('should throw an error if user not found', async () => {
    //   try {
    //     await getUserByFilterService.execute({ email: undefined });
    //   } catch (error) {
    //     expect(error).toBeInstanceOf(AppError);
    //     expect(error.code).toBe(404);
    //     expect(error.message).toBe('user not found');
    //   }
    // });
  });

  // describe('get user by id', () => {
  //   it('should get an user successfully', async () => {
  //     const result = await getUserByIdService.execute(mockNewUser.id);

  //     expect(userRepository.getUserById).toHaveBeenCalledTimes(1);
  //     expect(result).toEqual(mockNewUser);
  //   });

  //   it('should throw an error if user not found', async () => {
  //     try {
  //       await getUserByIdService.execute(invalidUserId);
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(AppError);
  //       expect(error.code).toBe(404);
  //       expect(error.message).toBe('user not found');
  //     }
  //   });
  // });

  // describe('update user', () => {
  //   it('should update an user successfully', async () => {
  //     const result = await updateUserService.execute(
  //       mockUpdateUser,
  //       mockNewUser.id,
  //     );

  //     expect(userRepository.updateUser).toHaveBeenCalledTimes(1);
  //     expect(result).toEqual(mockUpdateUserResponse);
  //   });

  //   it('should send an email confirmation if updating user email', async () => {
  //     await updateUserService.execute(mockUpdateUserEmail, mockNewUser.id);

  //     expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
  //   });

  //   it(`should throw an error if doesn't contain 'oldPassword' field when updating password`, async () => {
  //     try {
  //       await updateUserService.execute(
  //         updatePasswordInvalidBody,
  //         mockNewUser.id,
  //       );
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(AppError);
  //       expect(error.code).toBe(422);
  //       expect(error.message).toBe(`missing 'oldPassword' field`);
  //     }
  //   });

  //   it(`should throw an error if 'newPassword' and 'passwordConfirmation' doesn't match`, async () => {
  //     try {
  //       await updateUserService.execute(
  //         mockUpdateAccountPassword,
  //         mockNewUser.id,
  //       );
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(AppError);
  //       expect(error.code).toBe(422);
  //       expect(error.message).toBe('new passwords do not match');
  //     }
  //   });
  // });

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
