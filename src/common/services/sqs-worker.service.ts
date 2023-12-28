import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AppError } from '../errors/Error';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { configObject } from '../../modules/utils/configs/aws/credentials';

@Injectable()
export class SQSWorkerService {
  private readonly sqsClient = new SQSClient(configObject);

  constructor(private readonly mailerService: MailerService) {}

  private async processMessage(message: object): Promise<void> {
    await this.mailerService.sendMail(message);
  }

  private async deleteMessageFromSQS(
    queueUrl: string,
    receiptHandle: string,
  ): Promise<void> {
    try {
      const params = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqsClient.send(params);
    } catch (error) {
      throw new AppError(
        'sqs-worker-service.deleteMessage',
        500,
        'error deleting message from SQS',
      );
    }
  }

  async pollMessagesFromSQS(queueUrl: string): Promise<void> {
    const maxMessagesPerCycle = 20;

    try {
      const params = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      });

      const response = await this.sqsClient.send(params);

      if (response.Messages && response.Messages.length > 0) {
        const messagesToProcess = response.Messages.slice(
          0,
          maxMessagesPerCycle,
        );

        for (const message of messagesToProcess) {
          await this.processMessage(JSON.parse(message.Body));
          await this.deleteMessageFromSQS(queueUrl, message.ReceiptHandle);
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
