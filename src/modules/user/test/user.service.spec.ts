import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserService } from '../services/create-user.service';
import { GetUserByIdService } from '../services/get-user-by-id.service';
import { UpdateUserService } from '../services/update-user.service';
import { DeleteUserService } from '../services/delete-user.service';
import { UserRepository } from '../repository/user.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { mockCreateUser } from './mocks/services.mock';
import { mockNewUser } from './mocks/controller.mock';
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
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
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
        ipAddres: 'invalid ip address',
      };

      try {
        await createUserService.execute(invalidIpAddress);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(403);
        expect(error.message).toBe('cannot create user from a local server');
      }
    });
  });

  describe('get user by id', () => {
    it('should get an user successfully', async () => {
      const result = await getUserByIdService.execute(mockNewUser.id);

      expect(userRepository.getUserById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNewUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(userRepository, 'getUserById')
        .mockRejectedValueOnce(new Error());

      expect(getUserByIdService.execute(mockNewUser.id)).rejects.toThrowError();
    });
  });
});
