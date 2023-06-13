import { AppError } from '../../common/errors/Error';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private error: AppError) {}
  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof BadRequestException) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hold = exception.getResponse() as any;
      const message = hold?.message || exception.message;
      this.error = new AppError('bad.request', HttpStatus.BAD_REQUEST, message);
    }
    if (exception instanceof AppError) {
      this.error = exception;
    }

    response.status(this.error.code).json({
      error: {
        message: this.error.message,
        code: this.error.internalCode,
        status: true,
      },
      data: {},
    });
  }
}
