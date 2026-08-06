import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardKpisDto, DashboardChartsDto } from './dto/dashboard.dto';
import {
  Role,
  // PaymentStatus,
  BookingStatus,
  VerificationStatus,
} from '../generated/prisma/client';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardKpis(): Promise<DashboardKpisDto> {
    const totalUsers = await this.prisma.user.count({
      where: {
        deletedAt: null,
      },
    });

    const activeGuides = await this.prisma.guideProfile.count({
      where: {
        currentVerificationStatus: VerificationStatus.APPROVED,
      },
    });

    const totalBookings = await this.prisma.booking.count();

    // ── Revenue calculation ──────────────────────────────────
    //
    // OPTION A (active): Sum from BookingPricingSnapshot where booking is COMPLETED.
    // Represents agreed contract value — booking-centric view.
    //
    // OPTION B (commented): Sum from Payment where status = PAID.
    // Represents actual money received — finance-centric view.
    // Swap by commenting OPTION A and uncommenting OPTION B.
    // ────────────────────────────────────────────────────────

    // OPTION A
    const revenueResult = await this.prisma.bookingPricingSnapshot.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        booking: {
          status: BookingStatus.COMPLETED,
        },
      },
    });
    const totalRevenue = revenueResult._sum?.totalAmount
      ? Number(revenueResult._sum.totalAmount)
      : 0;

    // OPTION B
    // const revenueResult = await this.prisma.payment.aggregate({
    //   _sum: {
    //     amount: true,
    //   },
    //   where: {
    //     status: PaymentStatus.PAID,
    //   },
    // });
    // const totalRevenue = revenueResult._sum?.amount
    //   ? Number(revenueResult._sum.amount)
    //   : 0;

    return plainToInstance(DashboardKpisDto, {
      totalUsers,
      activeGuides,
      totalBookings,
      totalRevenue,
    });
  }

  async getDashboardCharts(): Promise<DashboardChartsDto> {
    // ── User/Guide ratio ─────────────────────────────────────

    const [userCount, guideCount] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: Role.TOURIST,
          deletedAt: null,
        },
      }),
      this.prisma.user.count({
        where: {
          role: Role.GUIDE,
          deletedAt: null,
        },
      }),
    ]);

    // ── Last 7 months window ─────────────────────────────────
    //
    // Build an ordered array of the last 7 months (oldest → newest).
    // Example (if today is July 2025):
    //   [Jan, Feb, Mar, Apr, May, Jun, Jul]
    //
    // monthStart: first day of that month at 00:00:00 UTC
    // monthEnd:   first day of NEXT month at 00:00:00 UTC
    // This gives a clean half-open interval [start, end)
    // that works correctly for createdAt range queries.
    // ────────────────────────────────────────────────────────

    const months = this.buildLast7Months();

    // ── Bookings over time ───────────────────────────────────

    const bookingsOverTime = await this.aggregateBookingsPerMonth(months);

    // ── Revenue over time ────────────────────────────────────
    //
    // OPTION A (active): BookingPricingSnapshot.totalAmount where booking COMPLETED.
    // OPTION B (commented): Payment.amount where status = PAID.
    // ────────────────────────────────────────────────────────

    // OPTION A
    const revenueOverTime =
      await this.aggregateRevenuePerMonthFromSnapshots(months);

    // OPTION B
    // const revenueOverTime = await this.aggregateRevenuePerMonthFromPayments(months);

    return plainToInstance(DashboardChartsDto, {
      bookingsOverTime,
      revenueOverTime,
      userGuideRatio: [
        { name: 'Users', value: userCount },
        { name: 'Guides', value: guideCount },
      ],
    });
  }

  // ── Private Helpers ──────────────────────────────────────────────────────────

  /**
   * Builds an ordered array of the last 7 months (oldest first).
   *
   * Each entry contains:
   *   label      — short display name ("Jan", "Feb" …)
   *   monthStart — UTC Date at 00:00:00 of the 1st of that month
   *   monthEnd   — UTC Date at 00:00:00 of the 1st of the NEXT month
   *
   * Using a half-open interval [monthStart, monthEnd) means:
   *   WHERE createdAt >= monthStart AND createdAt < monthEnd
   * which is unambiguous and avoids end-of-day edge cases.
   */
  private buildLast7Months(): Array<{
    label: string;
    monthStart: Date;
    monthEnd: Date;
  }> {
    const SHORT_MONTH_NAMES = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const now = new Date();
    const results = [];

    // i = 6 → oldest month, i = 0 → current month
    for (let i = 6; i >= 0; i--) {
      // Work in UTC to avoid timezone-shifted boundaries.
      // new Date(Date.UTC(year, month, 1)) always gives midnight UTC.
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth() - i; // JS handles negative months correctly

      const monthStart = new Date(Date.UTC(year, month, 1));
      const monthEnd = new Date(Date.UTC(year, month + 1, 1));

      results.push({
        label: SHORT_MONTH_NAMES[monthStart.getUTCMonth()],
        monthStart,
        monthEnd,
      });
    }

    return results;
  }

  /**
   * Counts bookings created within each month window.
   *
   * Runs 7 count queries in parallel via Promise.all —
   * acceptable at this scale. If this becomes a bottleneck,
   * replace with a single raw SQL GROUP BY query.
   */
  private async aggregateBookingsPerMonth(
    months: Array<{ label: string; monthStart: Date; monthEnd: Date }>,
  ): Promise<Array<{ name: string; value: number }>> {
    const counts = await Promise.all(
      months.map((m) =>
        this.prisma.booking.count({
          where: {
            createdAt: {
              gte: m.monthStart,
              lt: m.monthEnd,
            },
          },
        }),
      ),
    );

    return months.map((m, i) => ({
      name: m.label,
      value: counts[i],
    }));
  }

  /**
   * OPTION A — Revenue from BookingPricingSnapshot.totalAmount
   * where the linked booking has status = COMPLETED.
   *
   * Represents the agreed contract value (what was promised),
   * not necessarily what was collected via payment gateway.
   * More booking-centric. Use for operational dashboards.
   *
   * Groups by the booking's createdAt, not the snapshot's createdAt,
   * because the snapshot is created in the same transaction as the
   * booking — they are effectively the same timestamp. Using
   * booking.createdAt is more semantically correct ("when was
   * this booking made") for time-series charting.
   */
  private async aggregateRevenuePerMonthFromSnapshots(
    months: Array<{ label: string; monthStart: Date; monthEnd: Date }>,
  ): Promise<Array<{ name: string; value: number }>> {
    const totals = await Promise.all(
      months.map((m) =>
        this.prisma.bookingPricingSnapshot.aggregate({
          _sum: {
            totalAmount: true,
          },
          where: {
            booking: {
              status: BookingStatus.COMPLETED,
              createdAt: {
                gte: m.monthStart,
                lt: m.monthEnd,
              },
            },
          },
        }),
      ),
    );

    return months.map((m, i) => ({
      name: m.label,
      value: totals[i]._sum?.totalAmount
        ? Number(totals[i]._sum.totalAmount)
        : 0,
    }));
  }

  /**
   * OPTION B — Revenue from Payment.amount where status = PAID.
   *
   * Represents actual money received via payment gateway.
   * More finance-centric. Use for accounting dashboards.
   *
   * Groups by Payment.paidAt (not initiatedAt) because a payment
   * can be initiated in one month and settled in the next.
   * paidAt reflects when money actually moved.
   *
   * Note: paidAt is nullable — payments without a paidAt timestamp
   * are excluded automatically by the gte/lt filter.
   */
  // private async aggregateRevenuePerMonthFromPayments(
  //   months: Array<{ label: string; monthStart: Date; monthEnd: Date }>,
  // ): Promise<Array<{ name: string; value: number }>> {
  //   const totals = await Promise.all(
  //     months.map((m) =>
  //       this.prisma.payment.aggregate({
  //         _sum: {
  //           amount: true,
  //         },
  //         where: {
  //           status: PaymentStatus.PAID,
  //           paidAt: {
  //             gte: m.monthStart,
  //             lt: m.monthEnd,
  //           },
  //         },
  //       }),
  //     ),
  //   );
  //
  //   return months.map((m, i) => ({
  //     name: m.label,
  //     value: totals[i]._sum?.amount
  //       ? Number(totals[i]._sum.amount)
  //       : 0,
  //   }));
  // }
}
