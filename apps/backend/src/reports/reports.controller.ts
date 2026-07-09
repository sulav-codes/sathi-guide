import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../generated/prisma/client';
import type { JwtPayload } from '../common/strategies/jwt.strategy';

import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto, DismissReportDto } from './dto/resolve-report.dto';
import { AllReportsQueryDto } from './dto/all-reports-query.dto';
import { MyReportsQueryDto } from './dto/my-reports-query.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ============================================================================
  // AUTHENTICATED USER ENDPOINTS
  // ============================================================================

  /**
   * POST /reports - Create a report
   * Authenticated users can submit reports
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReportDto) {
    return this.reportsService.create(user.sub, dto);
  }

  /**
   * GET /reports/my - Get my submitted reports
   * Authenticated users can view their submitted reports
   */
  @Get('my')
  @HttpCode(HttpStatus.OK)
  async findMyReports(
    @CurrentUser() user: JwtPayload,
    @Query() query: MyReportsQueryDto,
  ) {
    return this.reportsService.findMyReports(user.sub, query);
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  /**
   * GET /reports - Get all reports (admin)
   * Admin role required
   */
  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: AllReportsQueryDto) {
    return this.reportsService.findAll(query);
  }

  /**
   * PATCH /reports/:id/resolve - Resolve a report (admin)
   * Admin role required
   */
  @Patch(':id/resolve')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async resolve(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
  ) {
    return this.reportsService.resolve(user.sub, id, dto);
  }

  /**
   * PATCH /reports/:id/dismiss - Dismiss a report (admin)
   * Admin role required
   */
  @Patch(':id/dismiss')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async dismiss(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: DismissReportDto,
  ) {
    return this.reportsService.dismiss(user.sub, id, dto);
  }
}
