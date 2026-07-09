import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ResolutionAction } from '../../generated/prisma/client';

export { ResolutionAction };

export class ResolveReportDto {
  @IsEnum(ResolutionAction)
  action!: ResolutionAction;

  @IsString()
  @IsOptional()
  note?: string;
}

export class DismissReportDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
