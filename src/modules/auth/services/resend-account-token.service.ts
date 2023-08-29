import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { IAuthRepository } from '../structure/auth-repository.structure';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ResendAccountTokenEmailService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,
    private mailerService: MailerService,
  ) {}

  async execute(id: string) {
    const { email, confirmationToken } =
      await this.authRepository.resendAccountToken(id);

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
  }
}
