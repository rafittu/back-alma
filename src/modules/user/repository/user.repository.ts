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

  async createUser(data: ICreateUser, status: UserStatus): Promise<User> {
    const salt = await bcrypt.genSalt();

    const personalInfo = {
      first_name: data.firstName,
      last_name: data.lastName,
      social_name: data.socialName,
      born_date: data.bornDate,
      mother_name: data.motherName,
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
      status,
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

      const {
        user_personal_info_id: userPersonalInfoId,
        user_contact_info_id: userContactInfoId,
        user_security_info_id: userSecurityInfoId,
        created_at: createdAt,
        updated_at: updatedAt,
      } = user;

      const { first_name: firstName, social_name: socialName } = user.personal;
      const { confirmation_token: confirmationToken } = user.security;

      delete user.user_personal_info_id;
      delete user.user_contact_info_id;
      delete user.user_security_info_id;
      delete user.created_at;
      delete user.updated_at;

      const userResponse = {
        ...user,
        personal: { id: userPersonalInfoId, firstName, socialName },
        security: { id: userSecurityInfoId, confirmationToken },
        contact: { id: userContactInfoId, ...user.contact },
        createdAt,
        updatedAt,
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

      const {
        user_personal_info_id: userPersonalInfoId,
        user_contact_info_id: userContactInfoId,
        user_security_info_id: userSecurityInfoId,
        status,
        created_at: createdAt,
        updated_at: updatedAt,
      } = user;

      const {
        first_name: firstName,
        last_name: lastName,
        social_name: socialName,
        born_date: bornDate,
        mother_name: motherName,
      } = user.personal;

      const { username, email, phone } = user.contact;

      delete user.user_personal_info_id;
      delete user.user_contact_info_id;
      delete user.user_security_info_id;
      delete user.created_at;
      delete user.updated_at;

      const userResponse = {
        ...user,
        status,
        personal: {
          id: userPersonalInfoId,
          firstName,
          lastName,
          socialName,
          bornDate,
          motherName,
          updatedAt: user.personal.updated_at,
        },
        contact: {
          id: userContactInfoId,
          username,
          email,
          phone,
          updatedAt: user.contact.updated_at,
        },
        security: {
          id: userSecurityInfoId,
          updatedAt: user.security.updated_at,
        },
        createdAt,
        updatedAt,
      };

      return userResponse;
    } catch (error) {
      throw new AppError('user-repository.getUserById', 404, 'user not found');
    }
  }

  async updateUser(data: IUpdateUser, userId: string) {
    const personalInfo = {
      first_name: data.firstName,
      last_name: data.lastName,
      social_name: data.socialName,
      born_date: data.bornDate,
      mother_name: data.motherName,
    };

    const contactInfo = {
      username: data.username,
      email: data.email,
      phone: data.phone,
    };

    let securityInfo = {};
    if (data.password) {
      /*needs to verify if old password match before actually update it*/
      const salt = await bcrypt.genSalt();

      securityInfo = {
        password: await bcrypt.hash(data.password, salt),
        salt,
        confirmation_token: crypto.randomBytes(32).toString('hex'),
        recover_token: null,
      };
    }

    const userData = {
      status: data.status,
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

      const {
        user_personal_info_id: userPersonalInfoId,
        user_contact_info_id: userContactInfoId,
        user_security_info_id: userSecurityInfoId,
        created_at: createdAt,
        updated_at: updatedAt,
      } = user;

      const { first_name: firstName, social_name: socialName } = user.personal;
      const { username, email } = user.contact;

      delete user.user_personal_info_id;
      delete user.user_contact_info_id;
      delete user.user_security_info_id;
      delete user.created_at;
      delete user.updated_at;

      const userResponse = {
        ...user,
        personal: {
          id: userPersonalInfoId,
          firstName,
          socialName,
          updatedAt: user.personal.updated_at,
        },
        contact: {
          id: userContactInfoId,
          username,
          email,
          updatedAt: user.contact.updated_at,
        },
        security: {
          id: userSecurityInfoId,
          updatedAt: user.security.updated_at,
        },
        createdAt,
        updatedAt,
      };

      return userResponse;
    } catch (error) {
      console.log(error);
      throw new AppError('user-repository.updateUser', 500, 'user not updated');
    }
  }
}
