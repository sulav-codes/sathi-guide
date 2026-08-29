import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationQueryDto {
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  lat!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  radius?: number = 50000; // default 50km
}
