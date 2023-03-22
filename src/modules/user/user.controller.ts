import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserService } from './services/create-user.service';

@Controller('user')
export class UserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.createUserService.execute(createUserDto);
  }
}
