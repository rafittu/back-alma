import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import {
  IUserRepository,
  PrismaUser,
} from '../interfaces/repository.interface';
import {
  IUser,
  IUpdateSecurityData,
  IUpdateUser,
} from '../interfaces/user.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { EmailService } from '../../../common/services/email.service';
import { Channel, User } from '@prisma/client';
import { SecurityService } from '../../../common/services/security.service';
import {
  ipv4Regex,
  ipv6Regex,
  mapUserToReturn,
} from '../../../modules/utils/helpers/helpers-user-module';
import { UserStatus } from '../interfaces/user-status.enum';
import { IJtwPayload } from 'src/modules/auth/interfaces/service.interface';

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
    private readonly securityService: SecurityService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  private validateIpAddress(ip: string): boolean {
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  private validatePassword(data: UpdateUserDto): void {
    if (!data.oldPassword || data.newPassword !== data.passwordConfirmation) {
      throw new AppError(
        'user-service.updateUser',
        422,
        !data.oldPassword
          ? `missing 'oldPassword' field`
          : 'new passwords do not match',
      );
    }
  }

  private generateUserToken(user: IUser) {
    const { id, contact, security } = user;

    const payload: IJtwPayload = {
      sub: id,
      username: contact.username,
      email: contact.email,
      status: security.status as UserStatus,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: process.env.REFRESH_JWT_EXPIRATION_TIME,
    });

    return { accessToken, refreshToken };
  }

  private formatUserToReturn(user: PrismaUser): IUser {
    return mapUserToReturn(user);
  }

  async execute(
    data: UpdateUserDto,
    userId: string,
    ipAddress: string,
  ): Promise<IUpdateUser> {
    if (!this.validateIpAddress(ipAddress)) {
      throw new AppError('user-service.updateUser', 403, 'invalid ip address');
    }

    let securityData: IUpdateSecurityData = {
      onUpdateIpAddress: ipAddress,
    };

    try {
      if (data.newPassword) {
        this.validatePassword(data);

        const { hashedPassword, salt } =
          await this.securityService.hashPassword(data.newPassword);

        securityData = {
          ...securityData,
          hashedPassword,
          salt,
        };
      }

      if (data.email) {
        const { token, expiresAt } = this.securityService.generateRandomToken();

        securityData = {
          ...securityData,
          confirmationToken: token,
          tokenExpiresAt: expiresAt,
          status: UserStatus.PENDING_CONFIRMATION,
        };
      }

      const user = await this.userRepository.updateUser(
        data,
        userId,
        securityData,
      );

      if (securityData.confirmationToken) {
        await this.emailService.sendConfirmationEmail(
          user.contact.email,
          securityData.confirmationToken,
          Channel.WOPHI,
        );
      }

      const formattedUser = this.formatUserToReturn(user);
      const { accessToken, refreshToken } =
        this.generateUserToken(formattedUser);

      return {
        accessToken,
        refreshToken,
        ...formattedUser,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'user-service.updateUser',
        500,
        'failed to update user data',
      );
    }
  }
}
