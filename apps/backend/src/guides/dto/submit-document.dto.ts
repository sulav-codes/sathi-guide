import { IsEnum, IsString, IsOptional, IsUUID } from 'class-validator';
import { IDDocumentType } from '../../generated/prisma/client';

export class SubmitDocumentDto {
  @IsEnum(IDDocumentType)
  documentType!: IDDocumentType;

  @IsString()
  documentNumber!: string;

  @IsUUID('4')
  frontImageId!: string;

  @IsOptional()
  @IsUUID('4')
  backImageId?: string;

  @IsOptional()
  @IsUUID('4')
  selfieImageId?: string;
}
