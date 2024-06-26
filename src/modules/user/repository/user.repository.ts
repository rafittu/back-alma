import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  IUserRepository,
  UserContactData,
  UserPersonalData,
  UserSecurityData,
  PrismaUser,
  reactivateData,
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
import { SecurityService } from '../../../common/services/security.service';

@Injectable()
export class UserRepository implements IUserRepository<User> {
  constructor(
    private prisma: PrismaService,
    private readonly securityService: SecurityService,
  ) {}

  private formatPersonalData({
    firstName,
    lastName,
    cpf,
    socialName,
    bornDate,
    motherName,
  }: Partial<ICreateUser>): UserPersonalData {
    return {
      first_name: firstName,
      last_name: lastName,
      cpf,
      social_name: socialName || null,
      born_date: bornDate,
      mother_name: motherName,
    };
  }

  private formatContactData({
    username,
    email,
    phone,
  }: Partial<ICreateUser>): UserContactData {
    /* istanbul ignore next */
    return {
      username: username || null,
      email: email,
      phone: phone,
    };
  }

  private async formatSecurityData({
    hashedPassword,
    salt,
    confirmationToken,
    tokenExpiresAt,
    ipAddressOrigin,
    status,
  }: ICreateUser): Promise<UserSecurityData> {
    return {
      hashed_password: hashedPassword,
      salt,
      confirmation_token: confirmationToken,
      recover_token: null,
      token_expires_at: tokenExpiresAt,
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
        create: this.formatPersonalData(data),
      },
      contact: {
        create: this.formatContactData(data),
      },
      security: {
        create: await this.formatSecurityData(data),
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
    const { id, ipAddress, confirmationToken, tokenExpiresAt } = data;

    try {
      await this.prisma.userSecurityData.update({
        data: {
          confirmation_token: confirmationToken,
          token_expires_at: tokenExpiresAt,
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
        'user_personal_data_id',
        'user_contact_data_id',
        'user_security_data_id',
        'hashed_password',
        'salt',
        'confirmation_token',
        'recover_token',
        'token_expires_at',
        'ip_address_origin',
        'on_update_ip_address',
        'origin_channel',
        'created_at',
        'cpf',
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
        'user_personal_data_id',
        'user_contact_data_id',
        'user_security_data_id',
        'hashed_password',
        'salt',
        'confirmation_token',
        'recover_token',
        'token_expires_at',
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
              hashed_password: true,
            },
          },
        },
      });

      const isPasswordMatch = await this.securityService.comparePasswords(
        data.oldPassword,
        security.hashed_password,
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
        token_expires_at: securityData.tokenExpiresAt,
        status: securityData.status,
      };
    }

    securityInfo = {
      ...data,
      ...securityInfo,
      on_update_ip_address: securityData.onUpdateIpAddress,
    };

    const dataToFormat = {
      ...data,
      bornDate: new Date(data.bornDate),
    };

    const userData = {
      personal: {
        update: this.formatPersonalData(dataToFormat),
      },
      contact: {
        update: this.formatContactData(dataToFormat),
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
        'user_personal_data_id',
        'user_contact_data_id',
        'user_security_data_id',
        'hashed_password',
        'salt',
        'confirmation_token',
        'recover_token',
        'token_expires_at',
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

  async cancelUser(userId: string, status: UserStatus): Promise<PrismaUser> {
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
        'user_personal_data_id',
        'user_contact_data_id',
        'user_security_data_id',
        'hashed_password',
        'salt',
        'confirmation_token',
        'recover_token',
        'token_expires_at',
        'ip_address_origin',
        'on_update_ip_address',
        'origin_channel',
        'created_at',
        'cpf',
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

  async findCancelledUsersToDelete(dateThreshold: Date): Promise<PrismaUser[]> {
    return await this.prisma.user.findMany({
      where: {
        security: {
          status: 'CANCELLED',
          updated_at: {
            lte: dateThreshold,
          },
        },
      },
      select: {
        id: true,
        personal: true,
        contact: true,
        security: true,
        allowed_channels: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.prisma.$transaction(async () => {
        const userData = await this.prisma.user.delete({
          where: { id: userId },
        });

        await this.prisma.userPersonalData.delete({
          where: { id: userData.user_personal_data_id },
        });
        await this.prisma.userContactData.delete({
          where: { id: userData.user_contact_data_id },
        });
        await this.prisma.userSecurityData.delete({
          where: { id: userData.user_security_data_id },
        });
      });
    } catch (error) {
      throw new AppError(
        'user-repository.deleteUser',
        500,
        'failed to delete user',
      );
    }
  }

  async reactivateAccount(data: reactivateData): Promise<void> {
    const { id, ipAddress, confirmationToken, tokenExpiresAt } = data;

    try {
      await this.prisma.user.update({
        data: {
          security: {
            update: {
              confirmation_token: confirmationToken,
              token_expires_at: tokenExpiresAt,
              on_update_ip_address: ipAddress,
            },
          },
        },
        where: {
          id,
        },
      });
    } catch (error) {
      throw new AppError(
        'user-repository.reactivateAccount',
        500,
        'failed to attach confirmation token',
      );
    }
  }
}
