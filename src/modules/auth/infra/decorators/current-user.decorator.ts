import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../../interfaces/service.interface';
import { UserPayload } from '../../interfaces/service.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserPayload => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    return request.user;
  },
);
