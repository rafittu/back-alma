import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  IUserRepository,
  UserContactInfo,
  UserPersonalInfo,
  UserSecurityInfo,
  PrismaUser,
} from '../interfaces/repository.interface';
import {
  ICreateUser,
  IRequestChannelAccess,
  IUserFilter,
  IUpdateSecurityData,
} from '../interfaces/user.interface';
import { UserStatus } from '../interfaces/user-status.enum';
import { AppError } from '../../../common/errors/Error';
import { Prisma, User } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PasswordService } from 'src/common/services/password.service';

@Injectable()
export class UserRepository implements IUserRepository<User> {
  constructor(
    private prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

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
    /* istanbul ignore next */
    return {
      username: username || null,
      email: email,
      phone: phone,
    };
  }

  private async formatSecurityInfo({
    hashedPassword,
    salt,
    confirmationToken,
    ipAddressOrigin,
    status,
  }: ICreateUser): Promise<UserSecurityInfo> {
    return {
      password: hashedPassword,
      salt,
      confirmation_token: confirmationToken,
      recover_token: null,
      ip_address_origin: ipAddressOrigin,
      status,
    };
  }

  private fieldsToDelete(prismaUser: PrismaUser, fields: string[]): PrismaUser {
    fields.forEach((field) => {
      /* istanbul ignore next */
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

  async getUserById(userId: string): Promise<PrismaUser> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: userId },
        include: {
          personal: true,
          contact: true,
          security: true,
        },
      });

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
      throw new AppError('user-repository.getUserById', 404, 'user not found');
    }
  }

  async updateUser(
    data: UpdateUserDto,
    userId: string,
    securityData: IUpdateSecurityData,
  ): Promise<PrismaUser> {
    let securityInfo = {};

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

      const isPasswordMatch = await this.passwordService.comparePasswords(
        data.oldPassword,
        security.password,
      );

      if (isPasswordMatch) {
        securityInfo = {
          password: securityData.hashedPassword,
          salt: securityData.salt,
        };
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
        confirmation_token: securityData.confirmationToken,
        status: securityData.status,
      };
    }

    securityInfo = {
      ...securityInfo,
      on_update_ip_address: securityData.onUpdateIpAddress,
    };

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
          personal: true,
          contact: true,
          security: true,
        },
      });

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
      if (error.code === 'P2002') {
        throw new AppError(
          'user-repository.updateUser',
          409,
          `${error.meta.target} already in use`,
        );
      }

      if (error.code === 'P2025') {
        throw new AppError(
          'user-repository.updateUser',
          400,
          'user id not found',
        );
      }

      throw new AppError('user-repository.updateUser', 500, 'user not updated');
    }
  }

  async deleteUser(userId: string, status: UserStatus): Promise<PrismaUser> {
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
          personal: true,
          contact: true,
          security: true,
        },
      });

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
        'user-repository.deleteUser',
        500,
        'user not cancelled',
      );
    }
  }
}
