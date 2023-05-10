import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseFilters,
} from '@nestjs/common';
import { Request } from 'express';
import { AppError } from '../../common/errors/Error';
import { HttpExceptionFilter } from '../../common/filter/http-exception.filter';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserService } from './services/create-user.service';
import { GetUserByIdService } from './services/get-user-by-id.service';
import { UpdateUserService } from './services/update-user.service';
import { User } from './structure/repository.structure';
import { DeleteUserService } from './services/delete-user.service';
import { isPublic } from '../auth/infra/decorators/is-public.decorator';
import { ConfirmAccountService } from './services/confirm-email.service';

@Controller('user')
@UseFilters(new HttpExceptionFilter(new AppError()))
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserByIdService: GetUserByIdService,
    private readonly updateUserService: UpdateUserService,
    private readonly deleteUserService: DeleteUserService,
    private readonly confirmAccountService: ConfirmAccountService,
  ) {}

  @isPublic()
  @Post('/signup')
  create(@Req() req: Request, @Body() body: CreateUserDto): Promise<User> {
    const createUserDto = body;
    const ipAddress = req.socket.remoteAddress;

    return this.createUserService.execute({ ...createUserDto, ipAddress });
  }

  @Get('/:id')
  getById(@Param('id') userId: string): Promise<User> {
    return this.getUserByIdService.execute(userId);
  }

  @Patch('/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    return await this.updateUserService.execute(body, userId);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') userId: string): Promise<User> {
    return await this.deleteUserService.execute(userId);
  }

  @isPublic()
  @Patch('/account/:token')
  async confirmAccount(
    @Param('token') confirmationToken: string,
  ): Promise<object> {
    return await this.confirmAccountService.execute(confirmationToken);
  }
}
