import { Injectable } from '@nestjs/common';
import { AppError } from '../errors/Error';
import * as AWS from 'aws-sdk';

@Injectable()
export class EmailService {
  private readonly sqs = new AWS.SQS();

  async sendConfirmationEmail(
    to: string,
    token: string,
    channel: string,
  ): Promise<void> {
    try {
      const email = {
        to,
        from: `${channel.toLowerCase()}@wophi.be`,
        subject: `${channel} - Email de confirmação`,
        template: `${channel.toLowerCase()}-email-confirmation`,
        context: {
          token,
        },
      };

      await this.sendToSQS(email);
    } catch (error) {
      throw new AppError(
        'email-service.sendConfirmationEmail',
        500,
        'failed to send email for account confirmation',
      );
    }
  }

  private async sendToSQS(message: object): Promise<void> {
    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: process.env.SQS_QUEUE_URL,
    };

    try {
      await this.sqs.sendMessage(params).promise();
    } catch (error) {
      throw new AppError(
        'email-service.sendToSQS',
        500,
        'failed to send message to SQS',
      );
    }
  }
}
