import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  async hashPassword(
    password: string,
  ): Promise<{ hashedPassword: string; salt: string }> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    return { hashedPassword, salt };
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
