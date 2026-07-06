import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../generated/prisma/client';
import type { JwtPayload } from '../common/strategies/jwt.strategy';

import {
  ExperienceListQueryDto,
  CreateExperienceDto,
  UpdateExperienceDto,
} from './dto';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  /**
   * GET /experiences - List all published experiences with filters
   * Public endpoint - no authentication required
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: ExperienceListQueryDto) {
    return this.experiencesService.findAll(query);
  }

  /**
   * GET /experiences/:id - Get specific experience public detail
   * Public endpoint - no authentication required
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.experiencesService.findOne(id);
  }

  // ============================================================================
  // GUIDE-ONLY ENDPOINTS
  // ============================================================================

  /**
   * GET /experiences/my/list - Get current guide's experiences
   * Guide role required
   */
  @Get('my/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async findMyExperiences(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.experiencesService.findMyExperiences(
      user.sub,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * POST /experiences - Create new experience (guide)
   * Guide role required
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateExperienceDto,
  ) {
    return this.experiencesService.create(user.sub, dto);
  }

  /**
   * PATCH /experiences/:id - Update experience (guide)
   * Guide role required
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.experiencesService.update(user.sub, id, dto);
  }

  /**
   * DELETE /experiences/:id - Delete experience (guide)
   * Guide role required
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.experiencesService.remove(user.sub, id);
    return { message: 'Experience deleted successfully' };
  }
}
