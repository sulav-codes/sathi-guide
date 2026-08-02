import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PresignedUrlResponseDto {
  @Expose()
  uploadUrl!: string;

  @Expose()
  key!: string;

  @Expose()
  token!: string;
}

@Exclude()
export class ConfirmUploadResponseDto {
  @Expose()
  id!: string;

  @Expose()
  key!: string;

  @Expose()
  url!: string;
}
