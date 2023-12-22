import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { addMinutes } from 'date-fns';

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

  generateRandomToken(): { token: string; expiresAt: Date } {
    const token = crypto.randomBytes(32).toString('hex');

    const currentDateTime = new Date();
    const expirationMinutes = 30;
    const expiresAt = addMinutes(currentDateTime, expirationMinutes);

    return { token, expiresAt };
  }

  isTokenValid(tokenExpiresAt: Date): boolean {
    const currentDateTime = new Date();

    return currentDateTime < tokenExpiresAt;
  }
}
