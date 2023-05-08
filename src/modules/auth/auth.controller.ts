import {
  Controller,
  Get,
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

@Controller('auth')
@UseFilters(new HttpExceptionFilter(new AppError()))
export class AuthController {
  constructor(private readonly signInService: SignInService) {}

  @isPublic()
  @Post('/signin')
  @UseGuards(LocalAuthGuard)
  signIn(@Request() req: AuthRequest): UserToken {
    const { user } = req;
    return this.signInService.execute(user);
  }

  @Get('/me')
  getMe(@CurrentUser() user: UserPayload) {
    return user;
  }
}
