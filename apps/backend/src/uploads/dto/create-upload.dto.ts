import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { UploadPurpose } from '../../generated/prisma/enums';

export class RequestPresignedUrlDto {
  @IsEnum(UploadPurpose)
  purpose!: UploadPurpose;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsString()
  @IsNotEmpty()
  filename!: string;

  /** For experience images: the draft experience ID to scope the storage path. */
  @IsOptional()
  @IsString()
  experienceId?: string;
}

export class ConfirmUploadDto {
  @IsString()
  @IsNotEmpty()
  /** The object storage key returned from the presign endpoint */
  key!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsEnum(UploadPurpose)
  purpose!: UploadPurpose;
}
