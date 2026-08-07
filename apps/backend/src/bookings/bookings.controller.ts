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
  StartTripDto,
  CompleteTripDto,
  GuideCancelBookingDto,
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
    return this.bookingsService.createBooking(user.sub, dto);
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
    await this.bookingsService.cancelBooking(user.sub, id, dto);
    return { message: 'Booking cancelled successfully' };
  }

  // ============================================================================
  // GUIDE ENDPOINTS  (must be declared BEFORE /:id to avoid wildcard clash)
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
    return this.bookingsService.findPendingBookingRequests(user.sub, query);
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
    return this.bookingsService.findUpcomingBookings(user.sub, query);
  }

  /**
   * GET /bookings/active - List active (IN_PROGRESS) bookings
   * Guide role required
   */
  @Get('active')
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async findActive(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findActiveBookings(user.sub);
  }

  /**
   * GET /bookings/history - List past/completed/cancelled bookings
   * Guide role required
   */
  @Get('history')
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async findHistory(
    @CurrentUser() user: JwtPayload,
    @Query() query: BookingRequestsQueryDto,
  ) {
    return this.bookingsService.findBookingHistory(user.sub, query);
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
    await this.bookingsService.acceptBooking(user.sub, id, dto);
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
    await this.bookingsService.rejectBooking(user.sub, id, dto);
    return { message: 'Booking rejected successfully' };
  }

  /**
   * POST /bookings/:id/start - Start trip
   * Guide role required
   */
  @Post(':id/start')
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async start(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: StartTripDto,
  ) {
    await this.bookingsService.startTrip(user.sub, id, dto);
    return { message: 'Trip started successfully' };
  }

  /**
   * POST /bookings/:id/complete - Complete trip
   * Guide role required
   */
  @Post(':id/complete')
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async complete(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CompleteTripDto,
  ) {
    await this.bookingsService.completeTrip(user.sub, id, dto);
    return { message: 'Trip completed successfully' };
  }

  /**
   * POST /bookings/:id/no-show - Mark tourist as no-show
   * Guide role required
   */
  @Post(':id/no-show')
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async noShow(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.bookingsService.markNoShow(user.sub, id);
    return { message: 'Booking marked as no-show' };
  }

  /**
   * POST /bookings/:id/cancel-guide - Guide cancels booking
   * Guide role required
   */
  @Post(':id/cancel-guide')
  @Roles(Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async cancelGuide(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: GuideCancelBookingDto,
  ) {
    await this.bookingsService.cancelByGuide(user.sub, id, dto);
    return { message: 'Booking cancelled successfully' };
  }

  // ============================================================================
  // SHARED ENDPOINTS  (wildcard :id — must come LAST)
  // ============================================================================

  /**
   * GET /bookings/:id - Get booking details
   * Tourist or Guide role required (must own the booking)
   */
  @Get(':id')
  @Roles(Role.TOURIST, Role.GUIDE)
  @HttpCode(HttpStatus.OK)
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bookingsService.findOneBooking(user.sub, user.role, id);
  }
}
