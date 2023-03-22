import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(125)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(125)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  socialName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10, { message: 'must be a valid born date: yyyy-mm-dd' })
  @Matches(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/, {
    message: 'must be a valid born date: yyyy-mm-dd',
  })
  bornDate: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  motherName: string;

  @IsOptional()
  @IsString()
  @MaxLength(45)
  username: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(250)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter and one number or symbol',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter and one number or symbol',
  })
  passwordConfirmation: string;
}
