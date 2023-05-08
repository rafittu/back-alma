import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { SignInService } from './services/signin.service';
import { LocalAuthGuard } from './infra/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly signInService: SignInService) {}

  @Post('/signin')
  @UseGuards(LocalAuthGuard)
  signIn(@Request() req) {
    const { user } = req;
    return this.signInService.execute(user);
  }
}
