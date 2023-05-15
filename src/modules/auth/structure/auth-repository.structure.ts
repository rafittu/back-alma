import { UserStatus } from 'src/modules/user/structure/user-status.enum';
import { CredentialsDto } from '../dto/credentials.dto';

export interface IAuthRepository<User> {
  validateUser(credentialsDto: CredentialsDto);
  confirmAccountEmail(
    confirmationToken: string,
    status: UserStatus,
  ): Promise<object>;
}
