import { Controller, Get, SerializeOptions } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @SerializeOptions({
    excludeExtraneousValues: false,
    strategy: 'exposeAll',
  })
  checkHealth() {
    return this.healthCheckService.check([
      async () =>
        this.prismaHealthIndicator.pingCheck('database', this.prismaService),
    ]);
  }
}
