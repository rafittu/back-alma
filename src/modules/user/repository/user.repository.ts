import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../prisma.service';
import { IUserRepository } from '../structure/repository.structure';
import { ICreateUser } from '../structure/service.structure';
import { UserStatus } from '../structure/user-status.enum';
import { AppError } from '../../../common/errors/Error';
import { ipAddressToInteger } from '../../../modules/utils/helpers/user-module';

@Injectable()
export class UserRepository implements IUserRepository<User> {
  constructor(private prisma: PrismaService) {}

  async createUser(data: ICreateUser, status: UserStatus): Promise<User> {
    const salt = await bcrypt.genSalt();

    const createUser = {
      first_name: data.firstName,
      last_name: data.lastName,
      social_name: data.socialName,
      born_date: data.bornDate,
      mother_name: data.motherName,
      status,
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: await bcrypt.hash(data.password, salt),
      ip_address: ipAddressToInteger(data.ipAddress),
      salt,
      confirmation_token: crypto.randomBytes(32).toString('hex'),
      recover_token: null,
    };

    try {
      const user = await this.prisma.user.create({ data: createUser });

      delete user.password;
      delete user.salt;

      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError(
          'user-repository.createUser',
          409,
          `${error.meta.target[0]} already in use`,
        );
      }
      throw new AppError('user-repository.createUser', 500, 'user not created');
    }
  }
}
