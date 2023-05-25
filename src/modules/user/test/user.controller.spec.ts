import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { CreateUserService } from '../services/create-user.service';
import { GetUserByIdService } from '../services/get-user-by-id.service';
import { UpdateUserService } from '../services/update-user.service';
import { DeleteUserService } from '../services/delete-user.service';
import {
  mockFakeRequest,
  mockCreateUserBody,
  mockNewUser,
  mockUpdateUser,
  mockUpdateUserResponse,
  mockDeleteUserResponse,
} from './mocks/controller.mock';

describe('UserController', () => {
  let controller: UserController;
  let createUserService: CreateUserService;
  let getUserByIdService: GetUserByIdService;
  let updateUserService: UpdateUserService;
  let deleteUserService: DeleteUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: CreateUserService,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockNewUser),
          },
        },
        {
          provide: GetUserByIdService,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockNewUser),
          },
        },
        {
          provide: UpdateUserService,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockUpdateUserResponse),
          },
        },
        {
          provide: DeleteUserService,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockDeleteUserResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    createUserService = module.get<CreateUserService>(CreateUserService);
    getUserByIdService = module.get<GetUserByIdService>(GetUserByIdService);
    updateUserService = module.get<UpdateUserService>(UpdateUserService);
    deleteUserService = module.get<DeleteUserService>(DeleteUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create user', () => {
    it('should create a new user successfully', async () => {
      const result = await controller.create(
        mockFakeRequest,
        mockCreateUserBody,
      );

      expect(createUserService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNewUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(createUserService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(
        controller.create(mockFakeRequest, mockCreateUserBody),
      ).rejects.toThrowError();
    });
  });

  describe('get user by id', () => {
    it('should get an user by id successfully', async () => {
      const result = await controller.getById(mockNewUser.id);

      expect(getUserByIdService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNewUser);
    });

    it('should throw an error', () => {
      jest
        .spyOn(getUserByIdService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(controller.getById(mockNewUser.id)).rejects.toThrowError();
    });
  });

  describe('update user', () => {
    it('should update an user successfully', async () => {
      const result = await controller.updateUser(
        mockNewUser.id,
        mockUpdateUser,
      );

      expect(updateUserService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdateUserResponse);
    });

    it('should throw an error', () => {
      jest
        .spyOn(updateUserService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(
        controller.updateUser(mockNewUser.id, mockUpdateUser),
      ).rejects.toThrowError();
    });
  });

  describe('delete user', () => {
    it('should delete an user successfully', async () => {
      const result = await controller.deleteUser(mockNewUser.id);

      expect(deleteUserService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeleteUserResponse);
    });

    it('should throw an error', () => {
      jest
        .spyOn(deleteUserService, 'execute')
        .mockRejectedValueOnce(new Error());

      expect(controller.deleteUser(mockNewUser.id)).rejects.toThrowError();
    });
  });
});
