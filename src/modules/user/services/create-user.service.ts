import { Inject, Injectable } from '@nestjs/common';
import { ipv4Regex, ipv6Regex } from '../../utils/helpers/helpers-user-module';
import { AppError } from '../../../common/errors/Error';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository } from '../interfaces/repository.interface';
import { UserStatus } from '../interfaces/user-status.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { ICreateUser, IUser } from '../interfaces/user.interface';
import { PasswordService } from './password.service';
import { EmailService } from './email.service';
import { User } from '@prisma/client';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository<User>,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
  ) {}

  private validateIpAddress(ip: string): boolean {
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  private async formatSecurityInfo(
    createUserDto: CreateUserDto,
  ): Promise<Partial<ICreateUser>> {
    const { password, salt } = await this.passwordService.hashPassword(
      createUserDto.password,
    );
    const confirmationToken = this.passwordService.generateRandomToken();

    return { password, salt, confirmationToken };
  }

  private mapUserToReturn(
    {
      firstName,
      lastName,
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
        id: user.user_personal_info_id,
        firstName,
        lastName,
        socialName,
        bornDate,
        motherName,
      },
      contact: {
        id: user.user_contact_info_id,
        username,
        email,
        phone,
      },
      security: {
        id: user.user_security_info_id,
        status,
      },
      allowedChannels: user.allowed_channels,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async execute(data: CreateUserDto, ipAddress: string): Promise<IUser> {
    const {
      id,
      allowed_channels: allowedChannels,
      contact,
    } = await this.userRepository.userByFilter({
      email: data.email,
    });

    if (allowedChannels) {
      try {
        const confirmationToken = this.passwordService.generateRandomToken();

        console.log(confirmationToken);

        throw new AppError(
          'user-service.createUser',
          409,
          `${id} cadastrado na plataforma ${allowedChannels}. Foi enviado um token de confirmação para ${contact.email}. Após confirmação, utilize os mesmo dados de ${allowedChannels} para acessar ${data.originChannel}.`,
        );
      } catch (error) {
        throw error;
      }

      // allowedChannels.includes(data.originChannel)
      // ? '1- Gera novo token; 2- Associar o token ao id do usuário e originChannel desejado; 3- Salva o novo token no banco de dados; 4- Enviar email de confirmação com o novo token;'
      // : 'segue o baile';
    }

    if (!this.validateIpAddress(ipAddress)) {
      throw new AppError('user-service.createUser', 403, 'invalid ip address');
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
      const { password, salt, confirmationToken } =
        await this.formatSecurityInfo(data);

      const user = await this.userRepository.createUser({
        ...data,
        ipAddressOrigin: ipAddress,
        password,
        salt,
        confirmationToken,
        allowedChannels: [data.originChannel],
        status: UserStatus.PENDING_CONFIRMATION,
      });

      await this.emailService.sendConfirmationEmail(
        data.email,
        confirmationToken,
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
