import { Module } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Module({
  controllers: [HealthService],
  providers: [HealthService],
})
export class HealthModule {}
