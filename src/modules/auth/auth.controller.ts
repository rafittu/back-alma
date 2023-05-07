import { Controller, Post, Request } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService) {}

  @Post('/signin')
  signIn(@Request() req) {
    const { user } = req;
    return this.authService.execute(user);
  }
}
