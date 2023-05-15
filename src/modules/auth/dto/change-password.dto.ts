import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'new password must contain at least one uppercase letter, one lowercase letter and one number or symbol',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'passwords doesnt match',
  })
  passwordConfirmation: string;
}
