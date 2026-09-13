import { Injectable } from '@nestjs/common';
import { prisma } from '@pulsewatch/database';
import { Redis } from 'ioredis';

@Injectable()
export class HealthService {
  private readonly redis = new Redis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
  );

  live() {
    return {
      status: 'ok' as const,
    };
  }

  async ready() {
    let postgres = false;
    let redis = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      postgres = true;
    } catch {
      postgres = false;
    }
    try {
      redis = (await this.redis.ping()) === 'PONG';
    } catch {
      redis = false;
    }

    return { postgres, redis };
  }
}
