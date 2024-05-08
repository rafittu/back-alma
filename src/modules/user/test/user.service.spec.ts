import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CreateUserService } from '../services/create-user.service';
import { GetUserByIdService } from '../services/get-user-by-id.service';
import { UpdateUserService } from '../services/update-user.service';
import { CancelUserService } from '../services/cancel-user.service';
import { UserRepository } from '../repository/user.repository';
import { AppError } from '../../../common/errors/Error';
import { GetUserByFilterService } from '../services/user-by-filter.service';
import {
  MockCancelledAccount,
  MockCreateUserDto,
  MockGenerateRandomToken,
  MockIUpdateUser,
  MockIUser,
  MockIpAddress,
  MockJWT,
  MockPrismaUser,
  MockReactivateUserAccount,
  MockRefreshJWT,
  MockUpdateUserDto,
  MockUser,
  MockUserByToken,
  MockUserData,
} from './mocks/user.mock';
import { SecurityService } from '../../../common/services/security.service';
import { EmailService } from '../../../common/services/email.service';
import { RedisCacheService } from '../../../common/redis/redis-cache.service';
import { Channel } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as schedule from 'node-schedule';
import { ScheduledTaskService } from '../services/scheduled-task.service';
import { ReactivateAccountService } from '../services/reactivate-account.service';
import { AuthRepository } from '../../../modules/auth/repository/auth.repository';

describe('User Services', () => {
  let createUserService: CreateUserService;
  let getUserByIdService: GetUserByIdService;
  let updateUserService: UpdateUserService;
  let cancelUserService: CancelUserService;
  let getUserByFilterService: GetUserByFilterService;
  let securityService: SecurityService;
  let emailService: EmailService;
  let scheduledTaskService: ScheduledTaskService;
  let reactivateAccountService: ReactivateAccountService;

  let mailerService: MailerService;
  let redisCacheService: RedisCacheService;
  let jwtService: JwtService;

  let userRepository: UserRepository;
  let authRepository: AuthRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        GetUserByIdService,
        UpdateUserService,
        CancelUserService,
        GetUserByFilterService,
        EmailService,
        SecurityService,
        ScheduledTaskService,
        JwtService,
        ReactivateAccountService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
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
            cancelUser: jest.fn().mockResolvedValue(MockPrismaUser),
            findCancelledUsersToDelete: jest
              .fn()
              .mockResolvedValue([MockPrismaUser]),
            deleteUser: jest.fn().mockResolvedValue(null),
            reactivateAccount: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            findUserByToken: jest.fn().mockResolvedValue(MockUserByToken),
            deleteSecurityToken: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    createUserService = module.get<CreateUserService>(CreateUserService);
    getUserByIdService = module.get<GetUserByIdService>(GetUserByIdService);
    updateUserService = module.get<UpdateUserService>(UpdateUserService);
    cancelUserService = module.get<CancelUserService>(CancelUserService);
    getUserByFilterService = module.get<GetUserByFilterService>(
      GetUserByFilterService,
    );
    reactivateAccountService = module.get<ReactivateAccountService>(
      ReactivateAccountService,
    );

    securityService = module.get<SecurityService>(SecurityService);
    emailService = module.get<EmailService>(EmailService);
    scheduledTaskService =
      module.get<ScheduledTaskService>(ScheduledTaskService);

    mailerService = module.get<MailerService>(MailerService);
    redisCacheService = module.get<RedisCacheService>(RedisCacheService);
    jwtService = module.get<JwtService>(JwtService);

    userRepository = module.get<UserRepository>(UserRepository);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    MockCreateUserDto.passwordConfirmation = MockCreateUserDto.password;

    MockIUser.personal.updatedAt = MockPrismaUser.updated_at;
    MockIUser.contact.updatedAt = MockPrismaUser.updated_at;
    MockIUser.security.updatedAt = MockPrismaUser.updated_at;

    MockUpdateUserDto.oldPassword = MockCreateUserDto.password;
  });

  it('should be defined', () => {
    expect(createUserService).toBeDefined();
    expect(getUserByIdService).toBeDefined();
    expect(updateUserService).toBeDefined();
    expect(cancelUserService).toBeDefined();
    expect(getUserByFilterService).toBeDefined();
    expect(emailService).toBeDefined();
    expect(scheduledTaskService).toBeDefined();
    expect(mailerService).toBeDefined();
    expect(redisCacheService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(reactivateAccountService).toBeDefined();
  });

  describe('create user', () => {
    it('should create a new user successfully', async () => {
      jest.spyOn(createUserService as unknown as never, 'validateIpAddress');
      jest.spyOn(createUserService as unknown as never, 'formatSecurityInfo');
      jest.spyOn(createUserService as unknown as never, 'mapUserToReturn');
      jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValueOnce();

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
        .spyOn(securityService, 'generateRandomToken')
        .mockResolvedValueOnce(MockGenerateRandomToken as never);

      jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValueOnce();

      jest
        .spyOn(userRepository, 'userByFilter')
        .mockResolvedValueOnce(MockUserData);

      MockUserData.allowed_channels = [Channel.MIAU];

      try {
        await createUserService.execute(MockCreateUserDto, MockIpAddress);
      } catch (error) {
        expect(securityService.generateRandomToken).toHaveBeenCalledTimes(1);
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
      jest.spyOn(updateUserService as unknown as never, 'validateIpAddress');
      jest.spyOn(updateUserService as unknown as never, 'validatePassword');
      jest.spyOn(updateUserService as unknown as never, 'generateUserToken');
      jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValueOnce();
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(MockJWT);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(MockRefreshJWT);

      const result = await updateUserService.execute(
        MockUpdateUserDto,
        MockUser.id,
        MockIpAddress,
      );

      expect(updateUserService['validateIpAddress']).toHaveBeenCalledTimes(1);
      expect(updateUserService['validatePassword']).toHaveBeenCalledTimes(1);
      expect(updateUserService['generateUserToken']).toHaveBeenCalledTimes(1);
      expect(userRepository.updateUser).toHaveBeenCalledTimes(1);
      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUpdateUser);
    });

    it(`should throw an error if 'ipAddress' is invalid`, async () => {
      const invalidIpAddress = 'invalid_ip_address';

      try {
        await updateUserService.execute(
          MockUpdateUserDto,
          MockIpAddress,
          invalidIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(403);
        expect(error.message).toBe('invalid ip address');
      }
    });

    it(`should throw an error if 'newPassword' and 'passwordConfirmation' doesn't match`, async () => {
      const invalidPasswordBody = {
        ...MockUpdateUserDto,
        newPassword: 'invalid_password',
      };

      try {
        await updateUserService.execute(
          invalidPasswordBody,
          MockUser.id,
          MockIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(422);
        expect(error.message).toBe('new passwords do not match');
      }
    });

    it(`should throw an error if 'oldPassword' is missing`, async () => {
      delete MockUpdateUserDto.oldPassword;

      try {
        await updateUserService.execute(
          MockUpdateUserDto,
          MockUser.id,
          MockIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(422);
        expect(error.message).toBe(`missing 'oldPassword' field`);
      }
    });

    it(`should throw an error if internal error happens`, async () => {
      jest
        .spyOn(userRepository, 'updateUser')
        .mockRejectedValueOnce(new Error());

      try {
        await updateUserService.execute(
          MockUpdateUserDto,
          MockUser.id,
          MockIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('failed to update user data');
      }
    });
  });

  describe('cancel user', () => {
    it('should cancel an user successfully', async () => {
      const result = await cancelUserService.execute(MockUser.id);

      expect(userRepository.cancelUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    it('should throw an error if user not cancelled', async () => {
      jest
        .spyOn(userRepository, 'cancelUser')
        .mockRejectedValueOnce(
          new AppError('user-repository.deleteUser', 500, 'user not cancelled'),
        );

      try {
        await cancelUserService.execute('invalid_id');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('user not cancelled');
      }
    });
  });

  describe('password services', () => {
    it('should hash password successfully', async () => {
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValueOnce('mockSalt' as never);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce('mockHashedPassword' as never);

      const result = await securityService.hashPassword(
        MockCreateUserDto.password,
      );

      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        hashedPassword: 'mockHashedPassword',
        salt: 'mockSalt',
      });
    });

    it('should generate a random token', async () => {
      const randomBytesMock = jest.spyOn(crypto, 'randomBytes');
      randomBytesMock.mockImplementationOnce(() => Buffer.from('mocked_token'));

      const { token } = securityService.generateRandomToken();

      expect(randomBytesMock).toHaveBeenCalledTimes(1);
      expect(randomBytesMock).toHaveBeenCalledWith(32);
      expect(token).toBe('6d6f636b65645f746f6b656e');
    });
  });

  describe('Scheduled task service', () => {
    it('should schedule to delete cancelled users', async () => {
      jest
        .spyOn(scheduledTaskService, 'deleteCancelledUsers')
        .mockResolvedValue(null);

      const scheduleJobMock = jest
        .spyOn(schedule, 'scheduleJob')
        .mockImplementationOnce((_cronPattern, callback) => {
          callback(new Date());
          return {} as schedule.Job;
        });

      scheduledTaskService.deleteCancelledUsersScheduledTask();

      expect(scheduleJobMock).toHaveBeenCalledTimes(1);
      expect(scheduledTaskService.deleteCancelledUsers).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should delete cancelled users', async () => {
      await scheduledTaskService.deleteCancelledUsers();

      expect(userRepository.findCancelledUsersToDelete).toHaveBeenCalledTimes(
        1,
      );
      expect(userRepository.deleteUser).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if user not deleted', async () => {
      jest
        .spyOn(userRepository, 'deleteUser')
        .mockRejectedValueOnce(new Error());

      try {
        await scheduledTaskService.deleteCancelledUsers();
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
        expect(error.message).toBe('could not delete users');
      }
    });
  });

  describe('reactivate user account', () => {
    it('should send a confirmation token to user email successfully', async () => {
      jest.spyOn(
        reactivateAccountService as unknown as never,
        'validateIpAddress',
      );
      jest
        .spyOn(userRepository, 'userByFilter')
        .mockResolvedValueOnce(MockCancelledAccount);
      jest
        .spyOn(securityService, 'generateRandomToken')
        .mockResolvedValueOnce(MockGenerateRandomToken as never);
      jest
        .spyOn(emailService, 'sendReactivateAccountEmail')
        .mockResolvedValueOnce();

      const result = await reactivateAccountService.execute(
        MockReactivateUserAccount,
        MockIpAddress,
      );

      expect(
        reactivateAccountService['validateIpAddress'],
      ).toHaveBeenCalledTimes(1);
      expect(userRepository.userByFilter).toHaveBeenCalledTimes(1);
      expect(securityService.generateRandomToken).toHaveBeenCalledTimes(1);
      expect(userRepository.reactivateAccount).toHaveBeenCalledTimes(1);
      expect(emailService.sendReactivateAccountEmail).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('message');
    });

    it('should confirm account reactivated successfully', async () => {
      jest.spyOn(
        reactivateAccountService as unknown as never,
        'validateIpAddress',
      );
      jest
        .spyOn(securityService, 'isTokenValid')
        .mockResolvedValueOnce(true as never);

      const result = await reactivateAccountService.execute(
        null,
        MockIpAddress,
        MockGenerateRandomToken.token,
      );

      expect(authRepository.findUserByToken).toHaveBeenCalledTimes(1);
      expect(securityService.isTokenValid).toHaveBeenCalledTimes(1);
      expect(userRepository.updateUser).toHaveBeenCalledTimes(1);
      expect(authRepository.deleteSecurityToken).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('message');
    });

    it(`should throw an error if 'ipAddress' is invalid`, async () => {
      const invalidIpAddress = 'invalid_ip_address';

      try {
        await reactivateAccountService.execute(
          MockReactivateUserAccount,
          invalidIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(403);
        expect(error.message).toBe('invalid ip address');
      }
    });

    it('should throw an error if account is not eligeble to be reactivated', async () => {
      jest.spyOn(userRepository, 'userByFilter').mockResolvedValueOnce(null);

      try {
        await reactivateAccountService.execute(
          MockReactivateUserAccount,
          MockIpAddress,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('account not eligeble to be reactivated');
      }
    });
  });
});
