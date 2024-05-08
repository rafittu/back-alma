import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { CreateUserService } from '../services/create-user.service';
import { GetUserByIdService } from '../services/get-user-by-id.service';
import { UpdateUserService } from '../services/update-user.service';
import { CancelUserService } from '../services/cancel-user.service';
import { GetUserByFilterService } from '../services/user-by-filter.service';
import {
  MockCreateUserDto,
  MockDefaultMessage,
  MockFakeRequest,
  MockIUpdateUser,
  MockIUser,
  MockReactivateUserAccount,
  MockUpdateUserDto,
  MockUserData,
  MockUserFromJwt,
} from './mocks/user.mock';
import { ReactivateAccountService } from '../services/reactivate-account.service';

describe('UserController', () => {
  let controller: UserController;
  let createUserService: CreateUserService;
  let getUserByIdService: GetUserByIdService;
  let updateUserService: UpdateUserService;
  let cancelUserService: CancelUserService;
  let getUserByFilterService: GetUserByFilterService;
  let reactivateAccountService: ReactivateAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: CreateUserService,
          useValue: {
            execute: jest.fn().mockResolvedValue(MockIUser),
          },
        },
        {
          provide: GetUserByIdService,
          useValue: {
            execute: jest.fn().mockResolvedValue(MockIUser),
          },
        },
        {
          provide: UpdateUserService,
          useValue: {
            execute: jest.fn().mockResolvedValue(MockIUpdateUser),
          },
        },
        {
          provide: CancelUserService,
          useValue: {
            execute: jest.fn().mockResolvedValue(MockIUser),
          },
        },
        {
          provide: GetUserByFilterService,
          useValue: {
            execute: jest.fn().mockResolvedValue(MockIUser),
          },
        },
        {
          provide: ReactivateAccountService,
          useValue: {
            execute: jest.fn().mockResolvedValue(MockDefaultMessage),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create user', () => {
    it('should create a new user successfully', async () => {
      const result = await controller.create(
        MockFakeRequest,
        MockCreateUserDto,
      );

      expect(createUserService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(createUserService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(
        controller.create(MockFakeRequest, MockCreateUserDto),
      ).rejects.toThrowError();
    });
  });

  describe('get user by id', () => {
    it('should get an user by id successfully', async () => {
      const result = await controller.getById(MockUserFromJwt);

      expect(getUserByIdService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(getUserByIdService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(controller.getById(MockUserFromJwt)).rejects.toThrowError();
    });
  });

  describe('update user', () => {
    it('should update an user successfully', async () => {
      const result = await controller.updateUser(
        MockFakeRequest,
        MockUserFromJwt,
        MockUpdateUserDto,
      );

      expect(updateUserService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUpdateUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(updateUserService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(
        controller.updateUser(
          MockFakeRequest,
          MockUserFromJwt,
          MockUpdateUserDto,
        ),
      ).rejects.toThrowError();
    });
  });

  describe('delete user', () => {
    it('should delete an user successfully', async () => {
      const result = await controller.deleteUser(MockUserFromJwt);

      expect(cancelUserService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(cancelUserService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(controller.deleteUser(MockUserFromJwt)).rejects.toThrowError();
    });
  });

  describe('get user by filter', () => {
    it('should get an user by email filter', async () => {
      const result = await controller.getByFilter({
        email: MockUserData.contact.email,
      });

      expect(getUserByFilterService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(getUserByFilterService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(
        controller.getByFilter({
          email: MockUserData.contact.email,
        }),
      ).rejects.toThrowError();
    });
  });

  describe('reactivate user account', () => {
    it('should reactivate user account successfully', async () => {
      const result = await controller.reactivateAccount(
        MockFakeRequest,
        MockReactivateUserAccount,
      );

      expect(reactivateAccountService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockDefaultMessage);
    });

    it('should throw an error', () => {
      jest
        .spyOn(reactivateAccountService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(
        controller.reactivateAccount(
          MockFakeRequest,
          MockReactivateUserAccount,
        ),
      ).rejects.toThrow();
    });
  });
});
