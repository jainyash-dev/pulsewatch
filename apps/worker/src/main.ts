import 'reflect-metadata';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { HealthService } from './health/health.service.js';

config({ path: resolve(process.cwd(), '../../.env') });

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const health = app.get(HealthService);
  const { postgres, redis } = await health.ready();
  const log = new Logger('worker');

  if (!postgres || !redis) {
    log.error(`worker not ready postgres=${postgres} redis=${redis}`);
    process.exit(1);
  }

  log.log('worker ready');
}
await bootstrap();
