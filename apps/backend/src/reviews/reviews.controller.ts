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
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../generated/prisma/client';
import type { JwtPayload } from '../common/strategies/jwt.strategy';
import { Public } from '../common/decorators/public.decorator';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GuideReviewsQueryDto } from './dto/guide-reviews-query.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  /**
   * GET /reviews/guide/:guideId - Get all reviews for a guide
   * Public endpoint - no authentication required
   */
  @Get('guide/:guideId')
  @Public()
  @HttpCode(HttpStatus.OK)
  async findByGuide(
    @Param('guideId') guideId: string,
    @Query() query: GuideReviewsQueryDto,
  ) {
    return this.reviewsService.findByGuide(guideId, query);
  }

  /**
   * GET /reviews/guide/:guideId/summary - Get review summary for a guide
   * Public endpoint - no authentication required
   */
  @Get('guide/:guideId/summary')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getReviewSummary(@Param('guideId') guideId: string) {
    return this.reviewsService.getReviewSummary(guideId);
  }

  // ============================================================================
  // TOURIST ENDPOINTS
  // ============================================================================

  /**
   * POST /reviews - Create review after completed booking
   * Tourist role required
   */
  @Post()
  @Roles(Role.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.sub, dto);
  }

  /**
   * GET /reviews/can-review/:guideId - Check if user can review a guide
   * Tourist role required
   */
  @Get('can-review/:guideId')
  @Roles(Role.TOURIST)
  @HttpCode(HttpStatus.OK)
  async canReview(
    @CurrentUser() user: JwtPayload,
    @Param('guideId') guideId: string,
  ) {
    return this.reviewsService.canReview(user.sub, guideId);
  }

  /**
   * PATCH /reviews/:id - Edit own review
   * Tourist role required
   */
  @Patch(':id')
  @Roles(Role.TOURIST)
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(user.sub, id, dto);
  }

  /**
   * DELETE /reviews/:id - Delete own review
   * Tourist role required
   */
  @Delete(':id')
  @Roles(Role.TOURIST)
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.reviewsService.remove(user.sub, id);
    return { message: 'Review deleted successfully' };
  }
}
