import { IsString, IsOptional, IsEnum } from 'class-validator';
import { BookingStatus } from '../../generated/prisma/client';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  reasonCode?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CancelBookingDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  reasonCode?: string;
}

export class AcceptBookingDto {
  @IsOptional()
  @IsString()
  guideNote?: string;
}

export class RejectBookingDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  reasonCode?: string;
}
