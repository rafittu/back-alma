import { Injectable } from '@nestjs/common';
import { AppError } from '../errors/Error';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { configObject } from '../../modules/utils/configs/aws/credentials';

@Injectable()
export class EmailService {
  private readonly sqsClient = new SQSClient(configObject);

  private async sendMessageToSQS(message: object): Promise<void> {
    try {
      const params = new SendMessageCommand({
        MessageBody: JSON.stringify(message),
        QueueUrl: process.env.SQS_QUEUE_URL,
      });

      await this.sqsClient.send(params);
    } catch (error) {
      throw new AppError(
        'email-service.sendMessageToSQS',
        500,
        'failed to send message to SQS',
      );
    }
  }

  async sendConfirmationEmail(
    to: string,
    token: string,
    channel: string,
  ): Promise<void> {
    try {
      const emailBody = {
        to,
        from: `${channel.toLowerCase()}@wophi.be`,
        subject: `${channel} - Email de confirmação`,
        template: `${channel.toLowerCase()}-email-confirmation`,
        context: {
          token,
        },
      };

      await this.sendMessageToSQS(emailBody);
    } catch (error) {
      throw new AppError(
        'email-service.sendConfirmationEmail',
        500,
        'failed to send email for account confirmation',
      );
    }
  }

  async sendRecoverPasswordEmail(
    to: string,
    token: string,
    channel: string,
  ): Promise<void> {
    try {
      const emailBody = {
        to,
        from: `${channel.toLowerCase()}@wophi.be`,
        subject: `${channel} - Recuperação de senha`,
        template: `${channel.toLowerCase()}-recover-password`,
        context: {
          token,
        },
      };

      await this.sendMessageToSQS(emailBody);
    } catch (error) {
      throw new AppError(
        'email-service.sendRecoverPasswordEmail',
        500,
        'failed to send email for recover password',
      );
    }
  }

  async sendReactivateAccountEmail(
    to: string,
    token: string,
    channel: string,
  ): Promise<void> {
    try {
      const emailBody = {
        to,
        from: `${channel.toLowerCase()}@wophi.be`,
        subject: `${channel} - Reativação de conta`,
        template: `${channel.toLowerCase()}-reactivate-account`,
        context: {
          token,
        },
      };

      await this.sendMessageToSQS(emailBody);
    } catch (error) {
      throw new AppError(
        'email-service.sendReactivateAccountEmail',
        500,
        'failed to send email for reactivate account',
      );
    }
  }
}
