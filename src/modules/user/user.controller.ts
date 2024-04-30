import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
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
import { CancelUserService } from './services/cancel-user.service';
import { isPublic } from '../auth/infra/decorators/is-public.decorator';
import { GetUserByFilterService } from './services/user-by-filter.service';
import { IUpdateUser, IUser, IUserFilter } from './interfaces/user.interface';
import { CurrentUser } from '../auth/infra/decorators/current-user.decorator';
import { IUserPayload } from '../auth/interfaces/service.interface';

@Controller('user')
@UseFilters(new HttpExceptionFilter(new AppError()))
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserByIdService: GetUserByIdService,
    private readonly updateUserService: UpdateUserService,
    private readonly deleteUserService: CancelUserService,
    private readonly getUserByFilterService: GetUserByFilterService,
  ) {}

  @isPublic()
  @Post('/signup')
  async create(
    @Req() req: Request,
    @Body() body: CreateUserDto,
  ): Promise<IUser> {
    const ipAddress = req.socket.remoteAddress;

    return await this.createUserService.execute(body, ipAddress);
  }

  @Get('/filter')
  async getByFilter(@Query() filter: IUserFilter): Promise<IUser | null> {
    return await this.getUserByFilterService.execute(filter);
  }

  @Get('/')
  async getById(@CurrentUser() user: IUserPayload): Promise<IUser> {
    return await this.getUserByIdService.execute(user.id);
  }

  @Patch('/update')
  async updateUser(
    @Req() req: Request,
    @CurrentUser() user: IUserPayload,
    @Body() body: UpdateUserDto,
  ): Promise<IUpdateUser> {
    const ipAddress = req.socket.remoteAddress;

    return await this.updateUserService.execute(body, user.id, ipAddress);
  }

  @Delete('/delete')
  async deleteUser(@CurrentUser() user: IUserPayload): Promise<IUser> {
    return await this.deleteUserService.execute(user.id);
  }
}
