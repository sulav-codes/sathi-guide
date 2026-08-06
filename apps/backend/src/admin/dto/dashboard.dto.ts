import { Expose, Type } from 'class-transformer';

export class DashboardKpisDto {
  @Expose()
  totalUsers!: number;

  @Expose()
  activeGuides!: number;

  @Expose()
  totalBookings!: number;

  @Expose()
  totalRevenue!: number;
}

export class ChartDataPointDto {
  @Expose()
  name!: string;

  @Expose()
  value!: number;
}

export class DashboardChartsDto {
  @Expose()
  @Type(() => ChartDataPointDto)
  bookingsOverTime!: ChartDataPointDto[];

  @Expose()
  @Type(() => ChartDataPointDto)
  revenueOverTime!: ChartDataPointDto[];

  @Expose()
  @Type(() => ChartDataPointDto)
  userGuideRatio!: ChartDataPointDto[];
}
