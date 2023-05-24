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
} from './mocks/create-user.mock';

describe('UserController', () => {
  let controller: UserController;
  let createUserService: CreateUserService;

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
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateUserService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteUserService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    createUserService = module.get<CreateUserService>(CreateUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create user', () => {
    it('should create a new user sucessfully', async () => {
      const result = await controller.create(
        mockFakeRequest,
        mockCreateUserBody,
      );

      expect(createUserService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNewUser);
    });
  });
});
