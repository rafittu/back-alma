import { Injectable } from '@nestjs/common';
import { AppError } from 'src/common/errors/Error';

@Injectable()
export class SignInService {
  execute(data) {
    throw new AppError(
      'auth-repository.validateUser',
      404,
      'method not implemented',
    );
  }
}
