import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { IDDocumentType } from '../../generated/prisma/client';

export class SubmitDocumentDto {
  @IsEnum(IDDocumentType)
  documentType!: IDDocumentType;

  @IsString()
  documentNumber!: string;

  @IsString()
  @IsNotEmpty()
  frontImageId!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  backImageId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  selfieImageId?: string;
}
