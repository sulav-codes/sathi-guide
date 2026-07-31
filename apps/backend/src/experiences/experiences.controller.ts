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
  CreateDraftExperienceDto,
  UpdateExperienceLocationDto,
  UpdateExperiencePricingDto,
  AddExperienceImageDto,
} from './dto';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: ExperienceListQueryDto) {
    return this.experiencesService.findAll(query);
  }

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async getCategories() {
    return this.experiencesService.getCategories();
  }

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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.experiencesService.findOne(id);
  }

  // ============================================================================
  // GUIDE-ONLY ENDPOINTS
  // ============================================================================

  /**
   * POST /experiences/draft
   * Creates a DRAFT experience with only Step 1 data. Returns { id, status }.
   */
  @Post('draft')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.CREATED)
  async createDraft(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateDraftExperienceDto,
  ) {
    return this.experiencesService.createDraft(user.sub, dto);
  }

  /**
   * POST /experiences (legacy — full creation in one request)
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

  /** PATCH /experiences/:id */
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

  /** PATCH /experiences/:id/location */
  @Patch(':id/location')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async updateLocation(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateExperienceLocationDto,
  ) {
    return this.experiencesService.updateLocation(user.sub, id, dto);
  }

  /** PATCH /experiences/:id/pricing */
  @Patch(':id/pricing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async updatePricing(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateExperiencePricingDto,
  ) {
    return this.experiencesService.updatePricing(user.sub, id, dto);
  }

  /** PATCH /experiences/:id/publish — validates all required fields, promotes DRAFT → PUBLISHED */
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async publish(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.experiencesService.publish(user.sub, id);
  }

  /** POST /experiences/:id/images — attach a confirmed upload to this experience */
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.CREATED)
  async addImage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AddExperienceImageDto,
  ) {
    return this.experiencesService.addImage(user.sub, id, dto);
  }

  /** DELETE /experiences/:id/images/:imageId */
  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeImage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.experiencesService.removeImage(user.sub, id, imageId);
  }

  /** DELETE /experiences/:id */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.experiencesService.remove(user.sub, id);
    return { message: 'Experience deleted successfully' };
  }
}
