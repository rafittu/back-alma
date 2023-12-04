import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import {
  IUserRepository,
  PrismaUser,
} from '../interfaces/repository.interface';
import { IUser } from '../interfaces/user.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { EmailService } from './email.service';
import { User } from '@prisma/client';
import { PasswordService } from './password.service';
import { mapUserToReturn } from 'src/modules/utils/helpers/helpers-user-module';

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

  async execute(data: UpdateUserDto, userId: string): Promise<IUser> {
    try {
      let securityInfo;

      if (data.newPassword) {
        this.validatePassword(data);

        const { password, salt } = await this.passwordService.hashPassword(
          data.newPassword,
        );

        securityInfo = {
          password,
          salt,
        };
      }

      if (data.email) {
        const confirmationToken = this.passwordService.generateRandomToken();

        securityInfo = {
          ...securityInfo,
          confirmationToken,
        };
      }

      const user = await this.userRepository.updateUser(
        data,
        userId,
        securityInfo,
      );

      if (securityInfo.confirmationToken) {
        await this.emailService.sendConfirmationEmail(
          user.contact.email,
          securityInfo.confirmationToken,
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
