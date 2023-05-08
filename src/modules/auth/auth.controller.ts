import {
  Controller,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { SignInService } from './services/signin.service';
import { LocalAuthGuard } from './infra/guards/local-auth.guard';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { AppError } from 'src/common/errors/Error';

@Controller('auth')
@UseFilters(new HttpExceptionFilter(new AppError()))
export class AuthController {
  constructor(private readonly signInService: SignInService) {}

  @Post('/signin')
  @UseGuards(LocalAuthGuard)
  signIn(@Request() req) {
    const { user } = req;
    return this.signInService.execute(user);
  }
}
