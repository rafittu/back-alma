import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { User } from '@prisma/client';
import { AppError } from 'src/common/errors/Error';
import { CredentialsDto } from '../dto/credentials';
import { IauthRepository } from '../structure/auth-repository.structure';

@Injectable()
export class AuthRepository implements IauthRepository<User> {
  constructor(private prisma: PrismaService) {}

  async validateUser(credentials: CredentialsDto): Promise<User> {
    throw new AppError(
      'auth-repository.validateUser',
      404,
      'method not implemented',
    );
  }
}
