import { Controller, Post, Req, UseFilters } from '@nestjs/common';
import { Request } from 'express';
import * as requestIp from 'request-ip';
import { AppError } from '../../common/errors/Error';
import { HttpExceptionFilter } from '../../common/filter/http-exception.filter';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserService } from './services/create-user.service';

@Controller()
@UseFilters(new HttpExceptionFilter(new AppError()))
export class UserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post('/signup')
  create(@Req() req: Request) {
    // transformar getIpAddress em decorator
    const createUserDto: CreateUserDto = req.body;
    const ipAddress = req.socket.remoteAddress;

    return this.createUserService.execute({ ...createUserDto, ipAddress });
  }
}
