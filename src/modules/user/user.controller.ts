import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
} from '@nestjs/common';
import { Request } from 'express';
import { AppError } from '../../common/errors/Error';
import { HttpExceptionFilter } from '../../common/filter/http-exception.filter';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserService } from './services/create-user.service';
import { GetUserByIdService } from './services/get-user-by-id.service';
import { PartialUser } from './structure/service.structure';

@Controller('user')
@UseFilters(new HttpExceptionFilter(new AppError()))
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserByIdService: GetUserByIdService,
  ) {}

  @Post('/signup')
  create(@Req() req: Request, @Body() body: CreateUserDto) {
    const createUserDto = body;
    const ipAddress = req.socket.remoteAddress;

    return this.createUserService.execute({ ...createUserDto, ipAddress });
  }

  @Get('/:id')
  getById(@Param('id') userId: string): Promise<PartialUser> {
    return this.getUserByIdService.execute(userId);
  }
}
