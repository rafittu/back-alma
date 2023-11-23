import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../prisma.service';
import {
  IUserRepository,
  UserContactInfo,
  UserPersonalInfo,
  UserSecurityInfo,
  UnformattedUser,
} from '../interfaces/repository.interface';
import {
  ICreateUser,
  IUpdateUser,
  IUserFilter,
} from '../interfaces/user.interface';
import { UserStatus } from '../interfaces/user-status.enum';
import { AppError } from '../../../common/errors/Error';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository implements IUserRepository<User> {
  constructor(private prisma: PrismaService) {}

  private formatPersonalInfo({
    firstName,
    lastName,
    socialName,
    bornDate,
    motherName,
  }: Partial<ICreateUser>): UserPersonalInfo {
    return {
      first_name: firstName,
      last_name: lastName,
      social_name: socialName || null,
      born_date: bornDate,
      mother_name: motherName,
    };
  }

  private formatContactInfo({
    username,
    email,
    phone,
  }: Partial<ICreateUser>): UserContactInfo {
    return {
      username: username || null,
      email: email,
      phone: phone,
    };
  }

  private async formatSecurityInfo({
    password,
    salt,
    confirmationToken,
    ipAddressOrigin,
    status,
  }: ICreateUser): Promise<UserSecurityInfo> {
    return {
      password,
      salt,
      confirmation_token: confirmationToken,
      recover_token: null,
      ip_address_origin: ipAddressOrigin,
      status,
    };
  }

  private formatUserResponse(user: UnformattedUser): User {
    return {
      id: user.id,
      personal: {
        id: user.user_personal_info_id,
        firstName: user.personal.first_name,
        lastName: user.personal.last_name,
        socialName: user.personal.social_name,
        bornDate: user.personal.born_date,
        motherName: user.personal.mother_name,
        updatedAt: user.personal.updated_at,
      },
      contact: {
        id: user.user_contact_info_id,
        username: user.contact.username,
        email: user.contact.email,
        phone: user.contact.phone,
        updatedAt: user.contact.updated_at,
      },
      security: {
        id: user.user_security_info_id,
        confirmationToken: user.security.confirmation_token,
        status: user.security.status,
        updatedAt: user.security.updated_at,
      },
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async createUser(data: ICreateUser): Promise<User> {
    const userData = {
      personal: {
        create: this.formatPersonalInfo(data),
      },
      contact: {
        create: this.formatContactInfo(data),
      },
      security: {
        create: await this.formatSecurityInfo(data),
      },
      origin_channel: data.originChannel,
      allowed_channels: data.allowedChannels,
    };

    try {
      const user = await this.prisma.user.create({
        data: userData,
      });

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

  async getUserById(userId: string): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: userId },
        include: {
          personal: true,
          contact: true,
          security: {
            select: {
              status: true,
              updated_at: true,
            },
          },
        },
      });

      const userResponse = this.formatUserResponse(user);
      return userResponse;
    } catch (error) {
      throw new AppError('user-repository.getUserById', 404, 'user not found');
    }
  }

  async updateUser(data: IUpdateUser, userId: string): Promise<User> {
    let securityInfo;

    if (data.newPassword) {
      const { security } = await this.prisma.user.findFirst({
        where: { id: userId },
        include: {
          security: {
            select: {
              password: true,
            },
          },
        },
      });

      const isPasswordMatch = await bcrypt.compare(
        data.oldPassword,
        security.password,
      );

      if (isPasswordMatch) {
        data.password = data.newPassword;
        securityInfo = await this.formatSecurityInfo(data, null);
        securityInfo.confirmation_token = null;
      } else {
        throw new AppError(
          'user-repository.updateUser',
          422,
          'old passwords do not match',
        );
      }
    }

    if (data.email) {
      securityInfo = {
        ...securityInfo,
        confirmation_token: crypto.randomBytes(32).toString('hex'),
        status: UserStatus.PENDING_CONFIRMATION,
      };
    }

    const userData = {
      personal: {
        update: this.formatPersonalInfo(data),
      },
      contact: {
        update: this.formatContactInfo(data),
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
          personal: {
            select: {
              first_name: true,
              last_name: true,
              social_name: true,
              updated_at: true,
            },
          },
          contact: {
            select: {
              username: true,
              email: true,
              updated_at: true,
            },
          },
          security: {
            select: {
              confirmation_token: true,
              status: true,
              updated_at: true,
            },
          },
        },
      });

      const userResponse = this.formatUserResponse(user);
      return userResponse;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError(
          'user-repository.updateUser',
          409,
          `${error.meta.target} already in use`,
        );
      }

      throw new AppError('user-repository.updateUser', 304, 'user not updated');
    }
  }

  async deleteUser(userId: string, status: UserStatus): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        data: {
          security: {
            update: {
              status,
            },
          },
        },
        where: { id: userId },
        include: {
          personal: {
            select: {
              first_name: true,
              social_name: true,
            },
          },
          contact: {
            select: {
              username: true,
              email: true,
            },
          },
          security: {
            select: {
              status: true,
            },
          },
        },
      });

      const userResponse = this.formatUserResponse(user);
      return userResponse;
    } catch (error) {
      throw new AppError(
        'user-repository.deleteUser',
        500,
        'user not cancelled',
      );
    }
  }

  async userByFilter(filter: IUserFilter): Promise<User | null> {
    const { id, email, phone } = filter;

    try {
      const userQuery: Prisma.UserWhereInput = {};

      id ? (userQuery.id = id) : userQuery;
      if (email || phone) {
        userQuery.contact = {
          ...(email && { email }),
          ...(phone && { phone }),
        };
      }

      const user = await this.prisma.user.findFirst({
        where: userQuery,
        include: {
          personal: true,
          contact: true,
          security: {
            select: {
              status: true,
              updated_at: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      const userResponse = this.formatUserResponse(user);
      return userResponse;
    } catch (error) {
      throw new AppError(
        'user-repository.getUserByFilter',
        500,
        'could not get user',
      );
    }
  }
}
