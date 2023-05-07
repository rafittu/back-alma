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
  User,
} from '../structure/repository.structure';
import { ICreateUser, IUpdateUser } from '../structure/service.structure';
import { UserStatus } from '../structure/user-status.enum';
import { AppError } from '../../../common/errors/Error';
import { ipAddressToInteger } from '../../utils/helpers/helpers-user-module';

@Injectable()
export class UserRepository implements IUserRepository<User> {
  constructor(private prisma: PrismaService) {}

  private formatPersonalInfo(user: IUpdateUser): UserPersonalInfo {
    return {
      first_name: user.firstName,
      last_name: user.lastName,
      social_name: user.socialName ? user.socialName : null,
      born_date: user.bornDate,
      mother_name: user.motherName,
    };
  }

  private formatContactInfo(user: IUpdateUser): UserContactInfo {
    return {
      username: user.username ? user.username : null,
      email: user.email,
      phone: user.phone ? user.phone : null,
    };
  }

  private async formatSecurityInfo(
    user: IUpdateUser,
  ): Promise<UserSecurityInfo> {
    const salt = await bcrypt.genSalt();

    return {
      password: await bcrypt.hash(user.password, salt),
      salt,
      confirmation_token: crypto.randomBytes(32).toString('hex'),
      recover_token: null,
      ip_address: ipAddressToInteger(user.ipAddress),
    };
  }

  private formatUserResponse(user: UnformattedUser): User {
    return {
      id: user.id,
      status: user.status,
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
        updatedAt: user.security.updated_at,
      },
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async createUser(data: ICreateUser, status: UserStatus): Promise<User> {
    const userData = {
      status,
      personal: {
        create: this.formatPersonalInfo(data),
      },
      contact: {
        create: this.formatContactInfo(data),
      },
      security: {
        create: await this.formatSecurityInfo(data),
      },
    };

    try {
      const user = await this.prisma.user.create({
        data: userData,
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
              confirmation_token: true,
            },
          },
        },
      });

      const userResponse = this.formatUserResponse(user);
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

  async getUserById(userId: string): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: userId },
        include: {
          personal: true,
          contact: true,
          security: {
            select: {
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
    let securityInfo = {};

    if (data.password) {
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
        securityInfo = await this.formatSecurityInfo(data);
      } else {
        throw new AppError(
          'user-repository.updateUser',
          422,
          'old passwords do not match',
        );
      }
    }

    const userData = {
      status: data.status,
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

      if (error.code) {
        throw new AppError(
          'user-repository.updateUser',
          500,
          `${error.code} - user not updated`,
        );
      }
      throw new AppError('user-repository.updateUser', 304, 'user not updated');
    }
  }

  async deleteUser(userId: string, status: UserStatus): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        data: { status },
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
              confirmation_token: true,
            },
          },
        },
      });

      const userResponse = this.formatUserResponse(user);
      return userResponse;
    } catch (error) {
      throw new AppError('user-repository.deleteUser', 500, 'user not updated');
    }
  }
}
