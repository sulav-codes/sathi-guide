import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class ApproveGuideDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  documentsReviewed?: string[];
}

export class RejectGuideDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
