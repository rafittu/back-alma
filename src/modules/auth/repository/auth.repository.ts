import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Channel, Prisma, User } from '@prisma/client';
import { AppError } from '../../../common/errors/Error';
import { CredentialsDto } from '../dto/credentials.dto';
import { IAuthRepository } from '../interfaces/auth-repository.interface';
import { IResendAccToken, IUserPayload } from '../interfaces/service.interface';
import { UserStatus } from '../../../modules/user/interfaces/user-status.enum';
import { PasswordService } from '../../../common/services/password.service';

@Injectable()
export class AuthRepository implements IAuthRepository<User> {
  constructor(
    private prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async validateUser(credentials: CredentialsDto): Promise<IUserPayload> {
    const { email, password } = credentials;

    const userData = await this.prisma.user.findFirst({
      where: {
        contact: { email },
      },
      select: {
        id: true,
        contact: {
          select: {
            username: true,
          },
        },
        security: {
          select: {
            password: true,
            status: true,
          },
        },
      },
    });

    if (userData) {
      const isPasswordValid = await this.passwordService.comparePasswords(
        password,
        userData.security.password,
      );

      if (isPasswordValid) {
        return {
          id: userData.id,
          username: userData.contact.username,
          email,
          status: userData.security.status,
        };
      }
    }

    throw new AppError(
      'auth-repository.validateUser',
      401,
      'email or password is invalid',
    );
  }

  async validateChannel(id: string, origin: Channel): Promise<void> {
    try {
      const userChannels = await this.prisma.user.findFirst({
        where: {
          id,
        },
        select: {
          allowed_channels: true,
        },
      });

      if (!userChannels || !userChannels.allowed_channels.includes(origin)) {
        throw new AppError(
          'auth-repository.validateChannel',
          401,
          'email or password is invalid',
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async confirmAccountEmail(
    confirmationToken: string,
    status: UserStatus,
    newChannel?: Channel,
  ): Promise<object> {
    try {
      const { id } = await this.prisma.userSecurityInfo.update({
        data: {
          confirmation_token: null,
          status,
        },
        where: {
          confirmation_token: confirmationToken,
        },
      });

      if (newChannel) {
        await this.prisma.user.update({
          data: {
            allowed_channels: {
              push: newChannel,
            },
          },
          where: {
            user_security_info_id: id,
          } as Prisma.UserWhereUniqueInput,
        });
      }

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
    try {
      const { user_security_info_id } = await this.prisma.user.findFirst({
        where: { contact: { email } },
        select: { user_security_info_id: true },
      });

      const userRecoverToken = this.passwordService.generateRandomToken();

      await this.prisma.userSecurityInfo.update({
        data: { recover_token: userRecoverToken },
        where: { id: user_security_info_id },
      });

      return userRecoverToken;
    } catch (error) {
      throw new AppError(
        'auth-repository.sendRecoverPasswordEmail',
        404,
        'user with this email not found',
      );
    }
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
      const { hashedPassword, salt } =
        await this.passwordService.hashPassword(password);

      await this.prisma.userSecurityInfo.update({
        data: {
          password: hashedPassword,
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

  async resendAccountToken(
    id: string,
    email: string,
  ): Promise<IResendAccToken> {
    try {
      const newConfirmationToken = this.passwordService.generateRandomToken();

      const { origin_channel } = await this.prisma.user.update({
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
        originChannel: origin_channel,
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
