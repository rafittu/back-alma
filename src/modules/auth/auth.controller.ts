import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { SignInService } from './services/signin.service';
import { LocalAuthGuard } from './infra/guards/local-auth.guard';
import { HttpExceptionFilter } from '../../common/filter/http-exception.filter';
import { AppError } from '../../common/errors/Error';
import {
  IAuthRequest,
  IUserPayload,
  IUserToken,
} from './interfaces/service.interface';
import { isPublic } from './infra/decorators/is-public.decorator';
import { CurrentUser } from './infra/decorators/current-user.decorator';
import { ConfirmAccountEmailService } from './services/confirm-email.service';
import { RecoverPasswordService } from './services/recover-password.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResendAccountTokenEmailService } from './services/resend-account-token.service';

@Controller('auth')
@UseFilters(new HttpExceptionFilter(new AppError()))
export class AuthController {
  constructor(
    private readonly signInService: SignInService,
    private readonly confirmAccountEmailService: ConfirmAccountEmailService,
    private readonly recoverPasswordService: RecoverPasswordService,
    private readonly resendAccountTokenEmailService: ResendAccountTokenEmailService,
  ) {}

  @isPublic()
  @Post('/signin')
  @UseGuards(LocalAuthGuard)
  async signIn(@Request() req: IAuthRequest): Promise<IUserToken> {
    const { user, body } = req;
    const bodyObject = Object(body);
    const { origin } = bodyObject;

    return await this.signInService.execute(user, origin);
  }

  @Patch('/account/resend-token')
  async resendAccountTokenEmail(
    @CurrentUser() user: IUserPayload,
    @Body('email') email: string,
  ): Promise<object> {
    const { id } = user;

    return await this.resendAccountTokenEmailService.execute(id, email);
  }

  @isPublic()
  @Patch('/account/:token')
  async confirmAccountEmail(
    @Req() req: ExpressRequest,
    @Param('token') confirmationToken: string,
  ): Promise<object> {
    const ipAddress = req.socket.remoteAddress;

    return await this.confirmAccountEmailService.execute(
      confirmationToken,
      ipAddress,
    );
  }

  @isPublic()
  @Post('/send-recover-password-email')
  async sendRecoverPasswordEmail(
    @Body('email') email: string,
  ): Promise<object> {
    return await this.recoverPasswordService.sendRecoverPasswordEmail(email);
  }

  @isPublic()
  @Patch('/reset-password/:token')
  async resetPassword(
    @Req() req: ExpressRequest,
    @Param('token') recoverToken: string,
    @Body() body: ChangePasswordDto,
  ): Promise<object> {
    const ipAddress = req.socket.remoteAddress;

    return await this.recoverPasswordService.resetPassword(
      recoverToken,
      body,
      ipAddress,
    );
  }

  @Get('/me')
  getMe(@CurrentUser() user: IUserPayload) {
    return user;
  }
}
