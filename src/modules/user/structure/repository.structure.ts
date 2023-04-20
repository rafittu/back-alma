import { ICreateUser, IUpdateUser, PartialUser } from './service.structure';
import { UserStatus } from './user-status.enum';

export interface IUserRepository<User> {
  createUser(data: ICreateUser, status: UserStatus);
  getUserById(id: string);
  updateUser(data: IUpdateUser, userId: string);
}
