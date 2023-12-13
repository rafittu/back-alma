import { User } from '.prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { IAuthRepository } from '../structure/auth-repository.structure';
import { UserRepository } from '../../../modules/user/repository/user.repository';
import { AppError } from '../../../common/errors/Error';
import { EmailService } from '../../../modules/user/services/email.service';

@Injectable()
export class ResendAccountTokenEmailService {
  constructor(
    @Inject(AuthRepository)
    private authRepository: IAuthRepository<User>,

    @Inject(UserRepository)
    private userRepository: UserRepository,

    private readonly emailService: EmailService,
  ) {}

  async execute(id: string, email: string): Promise<object> {
    try {
      if (!email) {
        throw new AppError(
          'auth-services.resendAccountToken',
          400,
          'Missing email parameter in request body',
        );
      }

      const existingUser = await this.userRepository.userByFilter({ email });

      if (!existingUser || existingUser.id === id) {
        const { confirmationToken, originChannel } =
          await this.authRepository.resendAccountToken(id, email);

        // substituir pelo serviço de email (modulo usuário)
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

      throw new AppError(
        'auth-services.resendAccountToken',
        400,
        'The new email provided is already in use',
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'auth-services.resendAccountToken',
        500,
        'Failed to resend account confirmation token',
      );
    }
  }
}
