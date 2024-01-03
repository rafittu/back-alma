import { Channel } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class RecoverPasswordDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(250)
  @Matches(
    /[a-z0-9!#$%&’*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&’*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    {
      message: 'must be a valid email',
    },
  )
  email: string;

  @IsNotEmpty()
  @IsEnum(Channel, { each: true })
  @IsString()
  originChannel: Channel;
}
