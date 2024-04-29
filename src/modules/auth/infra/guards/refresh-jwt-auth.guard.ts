import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppError } from '../../../../common/errors/Error';

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const canActivate = super.canActivate(context);
    const canActivatePromise = canActivate as Promise<boolean>;

    if (typeof canActivate === 'boolean') {
      return canActivate;
    }

    return canActivatePromise.catch((error) => {
      if (error instanceof AppError) {
        throw new AppError(error.internalCode, error.code, error.message);
      }
      throw new AppError('auth-guard.refreshJwtAuth', 401, error.message);
    });
  }
}
