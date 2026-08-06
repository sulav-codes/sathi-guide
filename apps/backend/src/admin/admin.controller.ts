import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/client';
import { DashboardKpisDto, DashboardChartsDto } from './dto/dashboard.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/kpis')
  @HttpCode(HttpStatus.OK)
  async getDashboardKpis(): Promise<DashboardKpisDto> {
    return this.adminService.getDashboardKpis();
  }

  @Get('dashboard/charts')
  @HttpCode(HttpStatus.OK)
  async getDashboardCharts(): Promise<DashboardChartsDto> {
    return this.adminService.getDashboardCharts();
  }
}
