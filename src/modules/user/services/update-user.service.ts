import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import {
  IUserRepository,
  PrismaUser,
} from '../interfaces/repository.interface';
import { IUser, SecurityData } from '../interfaces/user.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { EmailService } from './email.service';
import { User } from '@prisma/client';
import { PasswordService } from './password.service';
import { mapUserToReturn } from 'src/modules/utils/helpers/helpers-user-module';
import { UserStatus } from '../interfaces/user-status.enum';

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
  ) {}

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

  private formatUserToReturn(user: PrismaUser): IUser {
    return mapUserToReturn(user);
  }

  async execute(
    data: UpdateUserDto,
    userId: string,
    ipAddress: string,
  ): Promise<IUser> {
    let securityData: SecurityData = {
      onUpdateIpAddress: ipAddress,
    };

    try {
      if (data.newPassword) {
        this.validatePassword(data);

        const { password, salt } = await this.passwordService.hashPassword(
          data.newPassword,
        );

        securityData = {
          ...securityData,
          password,
          salt,
        };
      }

      if (data.email) {
        const confirmationToken = this.passwordService.generateRandomToken();

        securityData = {
          ...securityData,
          confirmationToken,
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
        );
      }

      return this.formatUserToReturn(user);
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
