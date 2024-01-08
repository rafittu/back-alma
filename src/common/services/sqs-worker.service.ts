import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AppError } from '../errors/Error';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { configObject } from '../../modules/utils/configs/aws/credentials';

@Injectable()
export class SQSWorkerService {
  constructor(private readonly mailerService: MailerService) {}

  private readonly sqsClient = new SQSClient(configObject);

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
        `error deleting message from SQS: ${error.message}`,
      );
    }
  }

  private async moveMessageToDLQ(message: object): Promise<void> {
    const dlqUrl = process.env.SQS_DLQ_QUEUE_URL;

    try {
      const params = new SendMessageCommand({
        MessageBody: JSON.stringify(message),
        QueueUrl: dlqUrl,
      });

      await this.sqsClient.send(params);
    } catch (error) {
      throw new AppError(
        'sqs-worker-service.moveToDLQ',
        500,
        `error moving message to DLQ: ${error.message}`,
      );
    }
  }

  private async processMessage(
    message: object,
    queueUrl: string,
    receiptHandle: string,
    retryCount: number = 0,
  ): Promise<void> {
    const timeDelayInSeconds = 9000;

    try {
      await this.mailerService.sendMail(message);
      await this.deleteMessageFromSQS(queueUrl, receiptHandle);
    } catch (error) {
      if (retryCount < 2) {
        await this.delay(timeDelayInSeconds);

        await this.processMessage(
          message,
          queueUrl,
          receiptHandle,
          retryCount + 1,
        );
      } else {
        await this.moveMessageToDLQ(message);

        await this.deleteMessageFromSQS(queueUrl, receiptHandle);

        throw new AppError(
          'sqs-worker-service.processMessage',
          500,
          `error processing message: ${error.message}`,
        );
      }
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
          await this.processMessage(
            JSON.parse(message.Body),
            queueUrl,
            message.ReceiptHandle,
          );
        }
      }
    } catch (error) {
      throw new AppError(
        'sqs-worker-service.pollMessagesFromSQS',
        500,
        `error polling messages from SQS: ${error.message}`,
      );
    }
  }
}
