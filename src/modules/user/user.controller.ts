import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { TemporaryUser } from './interfaces/repository.interface';
import { DeleteUserService } from './services/delete-user.service';
import { isPublic } from '../auth/infra/decorators/is-public.decorator';
import { GetUserByFilterService } from './services/user-by-filter.service';
import { IUser, IUserFilter } from './interfaces/user.interface';

@Controller('user')
@UseFilters(new HttpExceptionFilter(new AppError()))
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserByIdService: GetUserByIdService,
    private readonly updateUserService: UpdateUserService,
    private readonly deleteUserService: DeleteUserService,
    private readonly getUserByFilterService: GetUserByFilterService,
  ) {}

  @isPublic()
  @Post('/signup')
  create(@Req() req: Request, @Body() body: CreateUserDto): Promise<IUser> {
    const ipAddress = req.socket.remoteAddress;

    return this.createUserService.execute(body, ipAddress);
  }

  @Get('/filter')
  getByFilter(@Query() filter: IUserFilter): Promise<TemporaryUser | null> {
    return this.getUserByFilterService.execute(filter);
  }

  @Get('/:id')
  getById(@Param('id') userId: string): Promise<TemporaryUser> {
    return this.getUserByIdService.execute(userId);
  }

  @Patch('/update/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() body: UpdateUserDto,
  ): Promise<TemporaryUser> {
    return await this.updateUserService.execute(body, userId);
  }

  @Delete('/delete/:id')
  async deleteUser(@Param('id') userId: string): Promise<TemporaryUser> {
    return await this.deleteUserService.execute(userId);
  }
}
