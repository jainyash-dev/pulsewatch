import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  live() {
    return { data: this.healthService.live() };
  }

  @Get('ready')
  async ready() {
    const data = await this.healthService.ready();
    if (!data.redis || !data.postgres) {
      throw new HttpException({ data }, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return { data };
  }
}
