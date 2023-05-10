import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserStatus } from '../structure/user-status.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(125)
  firstName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(125)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  socialName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(10, { message: 'must be a valid born date: yyyy-mm-dd' })
  @Matches(
    /^([0-9]{4}-((0[13578]|1[02])-([0-2][1-9]|3[0-1])|(0[469]|11)-(0[1-9]|[1-2][0-9]|30)|02-(0[1-9]|[1-2][0-9]))|([0-9]{2}(([2468][048]|[02468][48])|[13579][26])|([13579][26]|[02468][048]|0[0-9]|1[0-6])00)-02-29)$/,
    {
      message: 'must be a valid born date and formatted as yyyy-mm-dd',
    },
  )
  bornDate: string;

  @IsOptional()
  @IsNotEmpty()
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
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'invalid old password',
  })
  oldPassword: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'new password must contain at least one uppercase letter, one lowercase letter and one number or symbol',
  })
  newPassword: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'passwords doesnt match',
  })
  passwordConfirmation: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
