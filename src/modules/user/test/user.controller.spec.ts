import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { CreateUserService } from '../services/create-user.service';
import { GetUserByIdService } from '../services/get-user-by-id.service';
import { UpdateUserService } from '../services/update-user.service';
import { DeleteUserService } from '../services/delete-user.service';
import { GetUserByFilterService } from '../services/user-by-filter.service';
import {
  MockCreateUserDto,
  MockFakeRequest,
  MockIUser,
  MockUpdateUserDto,
  MockUser,
  MockUserData,
} from './mocks/user.mock';

describe('UserController', () => {
  let controller: UserController;
  let createUserService: CreateUserService;
  let getUserByIdService: GetUserByIdService;
  let updateUserService: UpdateUserService;
  let deleteUserService: DeleteUserService;
  let getUserByFilterService: GetUserByFilterService;

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
            execute: jest.fn().mockResolvedValue(MockIUser),
          },
        },
        {
          provide: DeleteUserService,
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
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    createUserService = module.get<CreateUserService>(CreateUserService);
    getUserByIdService = module.get<GetUserByIdService>(GetUserByIdService);
    updateUserService = module.get<UpdateUserService>(UpdateUserService);
    deleteUserService = module.get<DeleteUserService>(DeleteUserService);
    getUserByFilterService = module.get<GetUserByFilterService>(
      GetUserByFilterService,
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
      const result = await controller.getById(MockUserData.id);

      expect(getUserByIdService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(getUserByIdService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(controller.getById(MockUserData.id)).rejects.toThrowError();
    });
  });

  describe('update user', () => {
    it('should update an user successfully', async () => {
      const result = await controller.updateUser(
        MockFakeRequest,
        MockUser.id,
        MockUpdateUserDto,
      );

      expect(updateUserService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(updateUserService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(
        controller.updateUser(MockFakeRequest, MockUser.id, MockUpdateUserDto),
      ).rejects.toThrowError();
    });
  });

  describe('delete user', () => {
    it('should delete an user successfully', async () => {
      const result = await controller.deleteUser(MockUser.id);

      expect(deleteUserService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MockIUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(deleteUserService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(controller.deleteUser(MockUser.id)).rejects.toThrowError();
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
});
