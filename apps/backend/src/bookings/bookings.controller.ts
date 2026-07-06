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
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../generated/prisma/client';
import type { JwtPayload } from '../common/strategies/jwt.strategy';

import { CreateBookingDto } from './dto/create-booking.dto';
import {
  CancelBookingDto,
  AcceptBookingDto,
  RejectBookingDto,
} from './dto/update-booking.dto';
import {
  MyBookingsQueryDto,
  BookingRequestsQueryDto,
  UpcomingBookingsQueryDto,
} from './dto/my-bookings-query.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ============================================================================
  // TOURIST ENDPOINTS
  // ============================================================================

  /**
   * POST /bookings - Create new booking request
   * Tourist role required
   */
  @Post()
  @Roles(Role.TOURIST)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.sub, dto);
  }

  /**
   * GET /bookings/my - List my bookings
   * Tourist role required
   */
  @Get('my')
  @Roles(Role.TOURIST)
  @HttpCode(HttpStatus.OK)
  async findMyBookings(
    @CurrentUser() user: JwtPayload,
    @Query() query: MyBookingsQueryDto,
  ) {
    return this.bookingsService.findMyBookings(user.sub, query);
  }

  /**
   * GET /bookings/:id - Get booking details
   * Tourist or Guide role required (must own the booking)
   */
  @Get(':id')
  @Roles(Role.TOURIST, Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bookingsService.findOne(user.sub, user.role, id);
  }

  /**
   * PATCH /bookings/:id/cancel - Cancel booking
   * Tourist role required
   */
  @Patch(':id/cancel')
  @Roles(Role.TOURIST)
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    await this.bookingsService.cancel(user.sub, id, dto);
    return { message: 'Booking cancelled successfully' };
  }

  // ============================================================================
  // GUIDE ENDPOINTS
  // ============================================================================

  /**
   * GET /bookings/requests - List pending booking requests
   * Guide role required
   */
  @Get('requests')
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async findPendingRequests(
    @CurrentUser() user: JwtPayload,
    @Query() query: BookingRequestsQueryDto,
  ) {
    return this.bookingsService.findPendingRequests(user.sub, query);
  }

  /**
   * PATCH /bookings/:id/accept - Accept booking
   * Guide role required
   */
  @Patch(':id/accept')
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async accept(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AcceptBookingDto,
  ) {
    await this.bookingsService.accept(user.sub, id, dto);
    return { message: 'Booking accepted successfully' };
  }

  /**
   * PATCH /bookings/:id/reject - Reject booking
   * Guide role required
   */
  @Patch(':id/reject')
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async reject(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RejectBookingDto,
  ) {
    await this.bookingsService.reject(user.sub, id, dto);
    return { message: 'Booking rejected successfully' };
  }

  /**
   * GET /bookings/upcoming - List upcoming confirmed bookings
   * Guide role required
   */
  @Get('upcoming')
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async findUpcoming(
    @CurrentUser() user: JwtPayload,
    @Query() query: UpcomingBookingsQueryDto,
  ) {
    return this.bookingsService.findUpcoming(user.sub, query);
  }
}
