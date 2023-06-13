import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { validate } from 'class-validator';
import { CredentialsDto } from '../../dto/credentials.dto';

@Injectable()
export class LoginValidationMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    const { body } = req;

    const loginRequestBody = new CredentialsDto();
    loginRequestBody.email = body.email;
    loginRequestBody.password = body.password;

    const validations = await validate(loginRequestBody);

    if (validations.length) {
      throw new BadRequestException(
        validations.reduce((acc, curr) => {
          return [...acc, ...Object.values(curr.constraints)];
        }, []),
      );
    }

    next();
  }
}
