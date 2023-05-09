import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../../structure/service.structure';
import { UserPayload } from '../../structure/service.structure';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserPayload => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    return request.user;
  },
);
