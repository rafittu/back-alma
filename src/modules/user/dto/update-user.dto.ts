import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserStatus } from '../structure/user-status.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MaxLength(125)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(125)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  socialName: string;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'must be a valid born date: yyyy-mm-dd' })
  @Matches(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/, {
    message: 'must be a valid born date: yyyy-mm-dd',
  })
  bornDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  motherName: string;

  @IsOptional()
  @IsString()
  @MaxLength(45)
  username: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(250)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'invalid old password',
  })
  oldPassword: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter and one number or symbol',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter and one number or symbol',
  })
  passwordConfirmation: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;
}
