import { CredentialsDto } from '../dto/credentials.dto';

export interface IauthRepository<User> {
  validateUser(credentialsDto: CredentialsDto);
}
