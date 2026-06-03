import { Exclude, Expose, Type } from 'class-transformer';
import { SafeUserDto } from './safe-user.dto';

@Exclude()
export class LoginResponseDto {
  @Expose()
  accessToken!: string;

  @Expose()
  refreshToken!: string;

  @Expose()
  @Type(() => SafeUserDto)
  user!: SafeUserDto;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
