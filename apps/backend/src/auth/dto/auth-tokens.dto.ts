import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AuthTokensDto {
  @Expose()
  accessToken!: string;

  @Expose()
  refreshToken!: string;

  constructor(partial: Partial<AuthTokensDto>) {
    Object.assign(this, partial);
  }
}
