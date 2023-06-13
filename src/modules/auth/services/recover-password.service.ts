import { Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { IAuthRepository } from '../structure/auth-repository.structure';
import { User } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPassword } from '../structure/service.structure';
import { AppError } from '../../../common/errors/Error';

@Injectable()
export class RecoverPasswordService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,
    private mailerService: MailerService,
  ) {}

  async sendRecoverPasswordEmail(email: string): Promise<object> {
    const recoverToken = await this.authRepository.sendRecoverPasswordEmail(
      email,
    );

    const mail = {
      to: email,
      from: 'noreply@application.com',
      subject: 'ALMA - Recuperação de senha',
      template: 'recover-password',
      context: {
        token: recoverToken,
      },
    };
    await this.mailerService.sendMail(mail);

    return {
      message: 'recover password email sent',
    };
  }

  async resetPassword(
    recoverToken: string,
    resetPasswordData: ResetPassword,
  ): Promise<object> {
    const { password, passwordConfirmation } = resetPasswordData;

    if (password !== passwordConfirmation) {
      throw new AppError(
        'recover-password-service.resetPassword',
        400,
        'passwords do not match',
      );
    }

    return await this.authRepository.resetPassword(recoverToken, password);
  }
}
