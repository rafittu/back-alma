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
  PrismaUser,
} from '../interfaces/repository.interface';
import {
  ICreateUser,
  IRequestChannelAccess,
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
      user_contact_info_id: user.id,
      user_personal_info_id: user.id,
      user_security_info_id: user.id,
      origin_channel: 'WOPHI',
      allowed_channels: ['WOPHI'],
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  private fieldsToDelete(prismaUser: PrismaUser, fields: string[]): PrismaUser {
    fields.forEach((field) => {
      if (field === 'updated_at') {
        return;
      }

      if (field !== 'created_at') {
        delete prismaUser[field];
      }

      delete prismaUser.personal[field];
      delete prismaUser.contact[field];
      delete prismaUser.security[field];
    });

    return prismaUser;
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

  async createAccessToAdditionalChannel(
    data: IRequestChannelAccess,
  ): Promise<void> {
    const { id, ipAddress, confirmationToken } = data;

    try {
      await this.prisma.userSecurityInfo.update({
        data: {
          confirmation_token: confirmationToken,
          on_update_ip_address: ipAddress,
        },
        where: {
          id,
        },
      });
    } catch (error) {
      throw new AppError(
        'user-repository.createAccessToAdditionalChannel',
        500,
        'failed to create access to the new channel',
      );
    }
  }

  async userByFilter(filter: IUserFilter): Promise<PrismaUser | null> {
    const { id, email, phone } = filter;

    try {
      const userQuery: Prisma.UserWhereInput = {
        ...(id && { id }),
        ...(email || phone
          ? {
              contact: {
                ...(email && { email }),
                ...(phone && { phone }),
              },
            }
          : {}),
      };

      const user = await this.prisma.user.findFirst({
        where: userQuery,
        include: {
          personal: true,
          contact: true,
          security: true,
        },
      });

      if (!user) {
        return null;
      }

      const fieldsToDelete = [
        'user_personal_info_id',
        'user_contact_info_id',
        'user_security_info_id',
        'password',
        'salt',
        'confirmation_token',
        'recover_token',
        'ip_address_origin',
        'on_update_ip_address',
        'origin_channel',
        'created_at',
      ];

      return this.fieldsToDelete(user, fieldsToDelete);
    } catch (error) {
      throw new AppError(
        'user-repository.getUserByFilter',
        500,
        'could not get user',
      );
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
        // securityInfo = await this.formatSecurityInfo(data);
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
}
