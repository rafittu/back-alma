export interface ICreateUser {
  firstName: string;
  lastName: string;
  socialName?: string;
  bornDate: string;
  motherName: string;
  username?: string;
  email: string;
  phone?: string;
  password: string;
  passwordConfirmation: string;
  ipAddress: string;
}
