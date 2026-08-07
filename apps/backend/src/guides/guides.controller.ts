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
import { GuidesService } from './guides.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../generated/prisma/client';
import type { JwtPayload } from '../common/strategies/jwt.strategy';

import {
  GuideListQueryDto,
  PendingGuidesQueryDto,
  CreateGuideProfileDto,
  UpdateGuideProfileDto,
  CreateBlockedPeriodDto,
  ApproveGuideDto,
  RejectGuideDto,
  SubmitDocumentDto,
} from './dto';

@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  /**
   * GET /guides - List all approved guides with filters
   * Public endpoint - no authentication required
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GuideListQueryDto) {
    return this.guidesService.findAll(query);
  }

  /**
   * GET /guides/:id - Get specific guide public profile
   * Public endpoint - no authentication required
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.guidesService.findOne(id);
  }

  // ============================================================================
  // GUIDE-ONLY ENDPOINTS
  // ============================================================================

  /**
   * GET /guides/me/profile - Get current guide's full profile
   * Guide role required
   */
  @Get('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.guidesService.getMyProfile(user.sub);
  }

  /**
   * POST /guides/profile - Create guide profile (user becomes guide)
   * Tourist role required - user upgrades to guide
   */
  @Post('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateGuideProfileDto,
  ) {
    return this.guidesService.createProfile(user.sub, dto);
  }

  /**
   * PATCH /guides/profile - Update guide profile
   * Guide role required
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateGuideProfileDto,
  ) {
    return this.guidesService.updateProfile(user.sub, dto);
  }

  /**
   * POST /guides/expertise - Add expertise to guide profile
   * Guide role required
   */
  @Post('expertise')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.CREATED)
  async addExpertise(
    @CurrentUser() user: JwtPayload,
    @Body() body: { categoryId: string; yearsOfExperience?: number },
  ) {
    await this.guidesService.addExpertise(
      user.sub,
      body.categoryId,
      body.yearsOfExperience,
    );
    return { message: 'Expertise added successfully' };
  }

  /**
   * DELETE /guides/expertise/:categoryId - Remove expertise from guide profile
   * Guide role required
   */
  @Delete('expertise/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async removeExpertise(
    @CurrentUser() user: JwtPayload,
    @Param('categoryId') categoryId: string,
  ) {
    await this.guidesService.removeExpertise(user.sub, categoryId);
    return { message: 'Expertise removed successfully' };
  }

  /**
   * PATCH /guides/location - Update guide location
   * Guide role required
   */
  @Patch('location')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      latitude: number;
      longitude: number;
      city: string;
      district: string;
      province?: string;
      country?: string;
      addressLine?: string;
    },
  ) {
    await this.guidesService.updateLocation(user.sub, body);
    return { message: 'Location updated successfully' };
  }

  /**
   * GET /guides/me/documents - Get guide's verification documents
   * Guide role required
   */
  @Get('me/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async getMyDocuments(@CurrentUser() user: JwtPayload) {
    return this.guidesService.getMyDocuments(user.sub);
  }

  /**
   * POST /guides/me/documents - Submit an ID document
   * Guide role required
   */
  @Post('me/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.CREATED)
  async submitDocument(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitDocumentDto,
  ) {
    await this.guidesService.submitDocument(user.sub, dto);
    return { message: 'Document submitted successfully' };
  }

  /**
   * GET /guides/me/blocked-periods - Get guide's blocked periods
   * Guide role required
   */
  @Get('me/blocked-periods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async getBlockedPeriods(@CurrentUser() user: JwtPayload) {
    return this.guidesService.getBlockedPeriods(user.sub);
  }

  /**
   * POST /guides/blocked-periods - Create blocked period
   * Guide role required
   */
  @Post('blocked-periods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.CREATED)
  async createBlockedPeriod(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBlockedPeriodDto,
  ) {
    await this.guidesService.createBlockedPeriod(user.sub, dto);
    return { message: 'Blocked period created successfully' };
  }

  /**
   * DELETE /guides/blocked-periods/:id - Delete blocked period
   * Guide role required
   */
  @Delete('blocked-periods/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async deleteBlockedPeriod(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    await this.guidesService.deleteBlockedPeriod(user.sub, id);
    return { message: 'Blocked period deleted successfully' };
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  /**
   * GET /guides/pending - List guides awaiting verification (admin)
   * Admin role required
   */
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findPending(@Query() query: PendingGuidesQueryDto) {
    return this.guidesService.findPending(query);
  }

  /**
   * PATCH /guides/:id/approve - Approve guide verification (admin)
   * Admin role required
   */
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async approveGuide(
    @Param('id') id: string,
    @CurrentUser() admin: JwtPayload,
    @Body() dto: ApproveGuideDto,
  ) {
    await this.guidesService.approveGuide(id, admin.sub, dto);
    return { message: 'Guide approved successfully' };
  }

  /**
   * PATCH /guides/:id/reject - Reject guide verification (admin)
   * Admin role required
   */
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async rejectGuide(
    @Param('id') id: string,
    @CurrentUser() admin: JwtPayload,
    @Body() dto: RejectGuideDto,
  ) {
    await this.guidesService.rejectGuide(id, admin.sub, dto);
    return { message: 'Guide rejected successfully' };
  }
}
