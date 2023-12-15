import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthRequest, IUserPayload } from '../../interfaces/service.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): IUserPayload => {
    const request = context.switchToHttp().getRequest<IAuthRequest>();

    return request.user;
  },
);
