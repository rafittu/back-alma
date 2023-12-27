import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as AWS from 'aws-sdk';
import { AppError } from '../errors/Error';

@Injectable()
export class SQSWorkerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly sqs = new AWS.SQS(),
  ) {}

  private async processMessage(message: object): Promise<void> {
    await this.mailerService.sendMail(message);
  }

  private async deleteMessage(
    queueUrl: string,
    receiptHandle: string,
  ): Promise<void> {
    const params = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    };

    try {
      await this.sqs.deleteMessage(params).promise();
    } catch (error) {
      throw new AppError(
        'sqs-worker-service.deleteMessage',
        500,
        'error deleting message from SQS',
      );
    }
  }

  async processMessages(queueUrl: string): Promise<void> {
    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 0,
    };

    try {
      const response = await this.sqs.receiveMessage(params).promise();

      if (response.Messages && response.Messages.length > 0) {
        for (const message of response.Messages) {
          await this.processMessage(JSON.parse(message.Body));
          await this.deleteMessage(queueUrl, message.ReceiptHandle);
        }
      }
    } catch (error) {
      throw new AppError(
        'sqs-worker-service.deleteMessage',
        500,
        'error processing messages from SQS',
      );
    }
  }
}
