import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../prisma.service';
import { IUserRepository } from '../structure/repository.structure';
import {
  ICreateUser,
  IUpdateUser,
  PartialUser,
} from '../structure/service.structure';
import { UserStatus } from '../structure/user-status.enum';
import { AppError } from '../../../common/errors/Error';
import { ipAddressToInteger } from '../../../modules/utils/helpers/user-module';

@Injectable()
export class UserRepository implements IUserRepository<User> {
  constructor(private prisma: PrismaService) {}

  async createUser(data: ICreateUser, status: UserStatus): Promise<User> {
    const salt = await bcrypt.genSalt();

    const personalInfo = {
      first_name: data.firstName,
      last_name: data.lastName,
      social_name: data.socialName,
      born_date: data.bornDate,
      mother_name: data.motherName,
      status,
    };

    const contactInfo = {
      username: data.username,
      email: data.email,
      phone: data.phone,
    };

    const securityInfo = {
      password: await bcrypt.hash(data.password, salt),
      salt,
      confirmation_token: crypto.randomBytes(32).toString('hex'),
      recover_token: null,
      ip_address: ipAddressToInteger(data.ipAddress),
    };

    const userData = {
      personal: {
        create: personalInfo,
      },
      contact: {
        create: contactInfo,
      },
      security: {
        create: securityInfo,
      },
    };

    try {
      const user = await this.prisma.user.create({
        data: userData,
        include: {
          contact: {
            select: {
              username: true,
              email: true,
            },
          },
          security: {
            select: {
              confirmation_token: true,
            },
          },
        },
      });

      const { confirmation_token: confirmationToken } = user.security;
      const userResponse = {
        ...user,
        security: { confirmationToken },
      };

      return userResponse;
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

  async getUserById(data: string): Promise<PartialUser> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: data },
        include: {
          personal: true,
          contact: true,
        },
      });

      const { updated_at: updatedAt } = user;
      const {
        first_name: firstName,
        last_name: lastName,
        social_name: socialName,
        born_date: bornDate,
        mother_name: motherName,
        created_at: createdAt,
        status,
      } = user.personal;
      const { username, email, phone } = user.contact;

      delete user.updated_at;

      const userResponse = {
        ...user,
        personal: { firstName, lastName, socialName, bornDate, motherName },
        contact: { username, email, phone },
        status,
        createdAt,
        updatedAt,
      };

      return userResponse;
    } catch (error) {
      throw new AppError('user-repository.getUserById', 404, 'user not found');
    }
  }

  async updateUser(data: IUpdateUser, userId: string) {
    const salt = await bcrypt.genSalt();

    const personalInfo = {
      first_name: data.firstName,
      last_name: data.lastName,
      social_name: data.socialName,
      born_date: data.bornDate,
      mother_name: data.motherName,
      status: data.status,
    };

    const contactInfo = {
      username: data.username,
      email: data.email,
      phone: data.phone,
    };

    const securityInfo = {
      password: await bcrypt.hash(data.password, salt),
      salt,
      confirmation_token: crypto.randomBytes(32).toString('hex'),
      recover_token: null,
    };

    const userData = {
      personal: {
        update: personalInfo,
      },
      contact: {
        update: contactInfo,
      },
      security: {
        update: securityInfo,
      },
    };

    try {
      const user = await this.prisma.user.update({
        data: userData,
        where: {
          id: userId,
        },
        include: {
          contact: {
            select: {
              username: true,
              email: true,
            },
          },
          security: {
            select: {
              confirmation_token: true,
            },
          },
        },
      });

      const { confirmation_token: confirmationToken } = user.security;
      const userResponse = {
        ...user,
        security: { confirmationToken },
      };

      return userResponse;
    } catch (error) {
      throw new AppError('user-repository.updateUser', 500, 'user not updated');
    }
  }
}
