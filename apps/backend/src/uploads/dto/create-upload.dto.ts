import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum UploadPurpose {
  EXPERIENCE = 'experience',
  AVATAR = 'avatar',
  DOCUMENT = 'document',
}

export class RequestPresignedUrlDto {
  @IsEnum(UploadPurpose)
  purpose!: UploadPurpose;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsString()
  @IsNotEmpty()
  filename!: string;
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
