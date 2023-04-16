import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseFilters,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { AppError } from '../../common/errors/Error';
import { HttpExceptionFilter } from '../../common/filter/http-exception.filter';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserService } from './services/create-user.service';
import { GetUserByIdService } from './services/get-user-by-id.service';
import { UpdateUserService } from './services/update-user.service';
import { PartialUser } from './structure/service.structure';

@Controller('user')
@UseFilters(new HttpExceptionFilter(new AppError()))
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserByIdService: GetUserByIdService,
    private readonly updateUserService: UpdateUserService,
  ) {}

  @Post('/signup')
  create(@Req() req: Request, @Body() body: CreateUserDto): Promise<User> {
    const createUserDto = body;
    const ipAddress = req.socket.remoteAddress;

    return this.createUserService.execute({ ...createUserDto, ipAddress });
  }

  @Get('/:id')
  getById(@Param('id') userId: string): Promise<PartialUser> {
    return this.getUserByIdService.execute(userId);
  }

  @Patch('/:id')
  async updateUser(@Param('id') userId: string, @Body() body: UpdateUserDto) {
    return await this.updateUserService.execute(body, userId);
  }
}
