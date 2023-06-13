import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository, User } from '../structure/repository.structure';
import { IUpdateUser } from '../structure/service.structure';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(UserRepository)
    private userRepository: IUserRepository<User>,
    private mailerService: MailerService,
  ) {}

  async execute(data: IUpdateUser, userId: string): Promise<User> {
    if (
      data.newPassword &&
      (!data.oldPassword || data.newPassword != data.passwordConfirmation)
    ) {
      throw new AppError(
        'user-service.updateUser',
        422,
        !data.oldPassword
          ? `missing 'oldPassword' field`
          : 'new passwords do not match',
      );
    }

    const user = await this.userRepository.updateUser(data, userId);

    if (data.email) {
      const email = {
        to: user.contact.email,
        from: 'noreply@application.com',
        subject: 'ALMA - Email de confirmação',
        template: 'email-confirmation',
        context: {
          token: user.security.confirmationToken,
        },
      };

      await this.mailerService.sendMail(email);
      delete user.security.confirmationToken;

      return user;
    }

    delete user.security.confirmationToken;
    return user;
  }
}
