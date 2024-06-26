import { Inject, Injectable } from '@nestjs/common';
import {
  ipv4Regex,
  ipv6Regex,
  validateCpf,
} from '../../utils/helpers/helpers-user-module';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository } from '../interfaces/repository.interface';
import { UserStatus } from '../interfaces/user-status.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { ICreateUser, IUser } from '../interfaces/user.interface';
import { SecurityService } from '../../../common/services/security.service';
import { EmailService } from '../../../common/services/email.service';
import { User } from '@prisma/client';
import { RedisCacheService } from '../../../common/redis/redis-cache.service';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository<User>,
    private readonly securityService: SecurityService,
    private readonly emailService: EmailService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  private validateIpAddress(ip: string): boolean {
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  private validateCPF(cpf: string): boolean {
    return validateCpf(cpf);
  }

  private async formatSecurityInfo(
    createUserDto: CreateUserDto,
  ): Promise<Partial<ICreateUser>> {
    const { hashedPassword, salt } = await this.securityService.hashPassword(
      createUserDto.password,
    );
    const { token, expiresAt } = this.securityService.generateRandomToken();

    return {
      hashedPassword,
      salt,
      confirmationToken: token,
      tokenExpiresAt: expiresAt,
    };
  }

  private mapUserToReturn(
    {
      firstName,
      lastName,
      cpf,
      socialName,
      bornDate,
      motherName,
      username,
      email,
      phone,
    }: CreateUserDto,
    user: User,
    status: string,
  ): IUser {
    return {
      id: user.id,
      personal: {
        id: user.user_personal_data_id,
        firstName,
        lastName,
        cpf,
        socialName,
        bornDate: new Date(bornDate),
        motherName,
      },
      contact: {
        id: user.user_contact_data_id,
        username,
        email,
        phone,
      },
      security: {
        id: user.user_security_data_id,
        status,
      },
      allowedChannels: user.allowed_channels,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async execute(data: CreateUserDto, ipAddress: string): Promise<IUser> {
    if (!this.validateIpAddress(ipAddress)) {
      throw new AppError('user-service.createUser', 403, 'invalid ip address');
    }

    if (!this.validateCPF(data.cpf)) {
      throw new AppError('user-service.createUser', 403, 'invalid user cpf');
    }

    const user =
      (await this.userRepository.userByFilter({
        email: data.email,
      })) ||
      (await this.userRepository.userByFilter({
        phone: data.phone,
      }));

    if (user && !user.allowed_channels.includes(data.originChannel)) {
      try {
        const { token, expiresAt } = this.securityService.generateRandomToken();

        await this.userRepository.createAccessToAdditionalChannel({
          id: user.security.id,
          ipAddress,
          confirmationToken: token,
          tokenExpiresAt: expiresAt,
        });

        const redisExpirationTime = 1620;
        await this.redisCacheService.set(
          token,
          data.originChannel,
          redisExpirationTime,
        );

        await this.emailService.sendConfirmationEmail(
          data.email,
          token,
          data.originChannel,
        );

        throw new AppError(
          'user-service.createUser',
          409,
          `User '${user.id}' registered on [ ${user.allowed_channels} ] platform. A confirmation token was sent to '${user.contact.email}' and after confirmation, use the same credentials from ${user.allowed_channels} to access [ ${data.originChannel} ].`,
        );
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }

        throw new AppError(
          'user-service.createUser',
          500,
          'failed to create access to new channel',
        );
      }
    }

    if (data.password !== data.passwordConfirmation) {
      throw new AppError(
        'user-service.createUser',
        422,
        'passwords do not match',
      );
    }
    delete data.passwordConfirmation;

    try {
      const { hashedPassword, salt, confirmationToken, tokenExpiresAt } =
        await this.formatSecurityInfo(data);

      const user = await this.userRepository.createUser({
        ...data,
        ipAddressOrigin: ipAddress,
        bornDate: new Date(data.bornDate),
        hashedPassword,
        salt,
        confirmationToken,
        tokenExpiresAt,
        allowedChannels: [data.originChannel],
        status: UserStatus.PENDING_CONFIRMATION,
      });

      await this.emailService.sendConfirmationEmail(
        data.email,
        confirmationToken,
        data.originChannel,
      );

      return this.mapUserToReturn(data, user, UserStatus.PENDING_CONFIRMATION);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'user-service.createUser',
        500,
        'failed to create user',
      );
    }
  }
}
