import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { SignInService } from './services/signin.service';
import { LocalAuthGuard } from './infra/guards/local-auth.guard';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { AppError } from 'src/common/errors/Error';
import {
  AuthRequest,
  UserPayload,
  UserToken,
} from './structure/service.structure';
import { isPublic } from './infra/decorators/is-public.decorator';
import { CurrentUser } from './infra/decorators/current-user.decorator';
import { ConfirmAccountEmailService } from './services/confirm-email.service';

@Controller('auth')
@UseFilters(new HttpExceptionFilter(new AppError()))
export class AuthController {
  constructor(
    private readonly signInService: SignInService,
    private readonly confirmAccountEmailService: ConfirmAccountEmailService,
  ) {}

  @isPublic()
  @Post('/signin')
  @UseGuards(LocalAuthGuard)
  signIn(@Request() req: AuthRequest): UserToken {
    const { user } = req;
    return this.signInService.execute(user);
  }

  @isPublic()
  @Patch('/account/:token')
  async confirmAccountEmail(
    @Param('token') confirmationToken: string,
  ): Promise<object> {
    return await this.confirmAccountEmailService.execute(confirmationToken);
  }

  @Get('/me')
  getMe(@CurrentUser() user: UserPayload) {
    return user;
  }
}
