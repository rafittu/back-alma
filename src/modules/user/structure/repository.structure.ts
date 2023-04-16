import { ICreateUser, IUpdateUser, PartialUser } from './service.structure';
import { UserStatus } from './user-status.enum';

export interface IUserRepository<User> {
  createUser(data: ICreateUser, status: UserStatus): Promise<User>;
  getUserById(id: string): Promise<PartialUser>;
  updateUser(data: IUpdateUser, userId: string);
}
