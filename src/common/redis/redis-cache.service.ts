import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_CONFIG_HOST,
      port: parseInt(process.env.REDIS_CONFIG_PORT),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async set(
    key: string,
    value: string,
    expiresInSeconds: number,
  ): Promise<void> {
    await this.redis.set(key, value, 'EX', expiresInSeconds);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
