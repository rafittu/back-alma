import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppError } from 'src/common/errors/Error';
import { CredentialsDto } from '../dto/credentials.dto';
import { IauthRepository } from '../structure/auth-repository.structure';

@Injectable()
export class AuthRepository implements IauthRepository<User> {
  constructor(private prisma: PrismaService) {}

  async validateUser(credentials: CredentialsDto): Promise<object> {
    const { email, password } = credentials;

    const userData = await this.prisma.userContactInfo.findUnique({
      where: {
        email,
      },
      select: {
        User: {
          select: {
            id: true,
            security: {
              select: {
                password: true,
              },
            },
          },
        },
      },
    });

    if (userData) {
      const isPasswordValid = await bcrypt.compare(
        password,
        userData.User[0].security.password,
      );

      if (isPasswordValid) {
        delete userData.User[0].security;
        return userData;
      }
    }

    throw new AppError(
      'auth-repository.validateUser',
      401,
      'email or password is invalid',
    );
  }
}
