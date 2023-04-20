import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../prisma.service';
import { IUserRepository } from '../structure/repository.structure';
import { ICreateUser, IUpdateUser } from '../structure/service.structure';
import { UserStatus } from '../structure/user-status.enum';
import { AppError } from '../../../common/errors/Error';
import { ipAddressToInteger } from '../../../modules/utils/helpers/user-module';

@Injectable()
export class UserRepository implements IUserRepository<User> {
  constructor(private prisma: PrismaService) {}

  private formatPersonalInfo(data) {
    return {
      first_name: data.firstName,
      last_name: data.lastName,
      social_name: data.socialName,
      born_date: data.bornDate,
      mother_name: data.motherName,
    };
  }

  private formatContactInfo(data) {
    return {
      username: data.username,
      email: data.email,
      phone: data.phone,
    };
  }

  private async formatSecurityInfo(data) {
    const salt = await bcrypt.genSalt();

    return {
      password: await bcrypt.hash(data.password, salt),
      salt,
      confirmation_token: crypto.randomBytes(32).toString('hex'),
      recover_token: null,
      ip_address: ipAddressToInteger(data.ipAddress),
    };
  }

  private formatUserResponse(user) {
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

  async createUser(data: ICreateUser, status: UserStatus) {
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

  async getUserById(data: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: data },
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

  async updateUser(data: IUpdateUser, userId: string) {
    let securityInfo = {};
    if (data.password) {
      /*needs to verify if old password match before actually update it*/
      securityInfo = await this.formatSecurityInfo(data);
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
}
