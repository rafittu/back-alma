import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { IAuthRepository } from '../structure/auth-repository.structure';
import { MailerService } from '@nestjs-modules/mailer';
import { UserRepository } from 'src/modules/user/repository/user.repository';
import { AppError } from 'src/common/errors/Error';

@Injectable()
export class ResendAccountTokenEmailService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,

    @Inject(UserRepository)
    private userRepository: UserRepository,

    private mailerService: MailerService,
  ) {}

  async execute(id: string, email: string): Promise<object> {
    try {
      const existingUser = await this.userRepository.userByFilter({ email });

      if (id !== existingUser.id) {
        throw new AppError(
          'auth-services.resendAccountToken',
          400,
          'The new email provided is already in use',
        );
      }

      const { confirmationToken } =
        await this.authRepository.resendAccountToken(id, email);

      const confirmAccountEmail = {
        to: email,
        from: 'noreply@application.com',
        subject: 'ALMA - Email de confirmação',
        template: 'email-confirmation',
        context: {
          token: confirmationToken,
        },
      };

      await this.mailerService.sendMail(confirmAccountEmail);

      return {
        message: `account confirmation token resent to ${email}`,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw new AppError(
          'auth-repository.createAppointment',
          error.code,
          error.message,
        );
      }

      throw new AppError(
        'auth-services.resendAccountToken',
        500,
        'Failed to resend account confirmation token',
      );
    }
  }
}
