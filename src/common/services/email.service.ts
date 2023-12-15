import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AppError } from '../errors/Error';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(
    to: string,
    token: string,
    channel: string,
  ): Promise<void> {
    console.log('email service', channel);
    try {
      const email = {
        to,
        from: 'alma@wophi.be',
        subject: 'ALMA - Email de confirmação',
        template: 'email-confirmation',
        context: {
          token,
        },
      };

      await this.mailerService.sendMail(email);
    } catch (error) {
      throw new AppError(
        'email-service.sendConfirmationEmail',
        500,
        'failed to send email for account confirmation',
      );
    }
  }
}