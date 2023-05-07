import { CredentialsDto } from '../dto/credentials';

export interface IauthRepository<User> {
  validateUser(credentialsDto: CredentialsDto);
}
