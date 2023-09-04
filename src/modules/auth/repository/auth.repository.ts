import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AppError } from '../../../common/errors/Error';
import { CredentialsDto } from '../dto/credentials.dto';
import {
  IAuthRepository,
  ResendAccToken,
} from '../structure/auth-repository.structure';
import { UserPayload } from '../structure/service.structure';
import { UserStatus } from 'src/modules/user/structure/user-status.enum';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthRepository implements IAuthRepository<User> {
  constructor(private prisma: PrismaService) {}

  async validateUser(credentials: CredentialsDto): Promise<UserPayload> {
    const { email, password } = credentials;

    const userData = await this.prisma.userContactInfo.findUnique({
      where: {
        email,
      },
      select: {
        username: true,
        User: {
          select: {
            id: true,
            security: {
              select: {
                password: true,
              },
            },
          },
        },
      },
    });

    if (userData) {
      const isPasswordValid = await bcrypt.compare(
        password,
        userData.User[0].security.password,
      );

      if (isPasswordValid) {
        delete userData.User[0].security;

        return {
          id: userData.User[0].id,
          username: userData.username,
          email,
        };
      }
    }

    throw new AppError(
      'auth-repository.validateUser',
      401,
      'email or password is invalid',
    );
  }

  async confirmAccountEmail(
    confirmationToken: string,
    status: UserStatus,
  ): Promise<object> {
    try {
      await this.prisma.userSecurityInfo.update({
        data: {
          confirmation_token: null,
          status,
        },
        where: {
          confirmation_token: confirmationToken,
        },
      });

      return {
        message: 'account email successfully confirmed',
      };
    } catch (error) {
      throw new AppError(
        'auth-repository.confirmAccountEmail',
        500,
        'Account not confirmed',
      );
    }
  }

  async sendRecoverPasswordEmail(email: string): Promise<string> {
    const userContactInfo = await this.prisma.userContactInfo.findFirst({
      where: { email },
      include: {
        User: {
          select: {
            user_security_info_id: true,
          },
        },
      },
    });

    if (!userContactInfo) {
      throw new AppError(
        'auth-repository.sendRecoverPasswordEmail',
        404,
        'user with this email not found',
      );
    }

    const userRecoverToken = randomBytes(32).toString('hex');
    await this.prisma.userSecurityInfo.update({
      data: {
        recover_token: userRecoverToken,
      },
      where: {
        id: userContactInfo.User[0].user_security_info_id,
      },
    });

    return userRecoverToken;
  }

  async resetPassword(recoverToken: string, password: string): Promise<object> {
    const user = await this.prisma.userSecurityInfo.findFirst({
      where: { recover_token: recoverToken },
    });

    if (!user) {
      throw new AppError(
        'auth-repository.resetPassword',
        404,
        'invalid recover token',
      );
    }

    try {
      const salt = await bcrypt.genSalt();

      await this.prisma.userSecurityInfo.update({
        data: {
          password: await bcrypt.hash(password, salt),
          salt,
          recover_token: null,
        },
        where: {
          id: user.id,
        },
      });

      return {
        message: 'password reseted',
      };
    } catch (error) {
      throw new AppError(
        'auth-repository.resetPassword',
        500,
        'password not reseted',
      );
    }
  }

  async resendAccountToken(id: string, email: string): Promise<ResendAccToken> {
    try {
      const newConfirmationToken = crypto.randomBytes(32).toString('hex');

      await this.prisma.user.update({
        data: {
          security: {
            update: {
              confirmation_token: newConfirmationToken,
            },
          },
          contact: {
            update: {
              email,
            },
          },
        },
        where: {
          id,
        },
      });

      return {
        confirmationToken: newConfirmationToken,
      };
    } catch (error) {
      throw new AppError(
        'auth-repository.resendAccountToken',
        500,
        'Account token not generated',
      );
    }
  }
}
