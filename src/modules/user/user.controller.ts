import { Body, Controller, Post, Req, UseFilters } from '@nestjs/common';
import { Request } from 'express';
import { AppError } from '../../common/errors/Error';
import { HttpExceptionFilter } from '../../common/filter/http-exception.filter';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserService } from './services/create-user.service';

@Controller()
@UseFilters(new HttpExceptionFilter(new AppError()))
export class UserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post('/signup')
  create(@Req() req: Request, @Body() body: CreateUserDto) {
    const createUserDto = body;
    const ipAddress = req.socket.remoteAddress;

    return this.createUserService.execute({ ...createUserDto, ipAddress });
  }
}
