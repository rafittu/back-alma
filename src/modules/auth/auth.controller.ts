import { Controller, Post, Request } from '@nestjs/common';
import { SignInService } from './services/signin.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly signInService: SignInService) {}

  @Post('/signin')
  signIn(@Request() req) {
    const { user } = req;
    return this.signInService.execute(user);
  }
}
