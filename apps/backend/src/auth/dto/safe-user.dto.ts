import { Role } from '../../generated/prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SafeUserDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  phone!: string | null;

  @Expose()
  role!: Role;

  @Expose()
  isEmailVerified!: boolean;

  @Expose()
  isPhoneVerified!: boolean;

  @Expose()
  avatarId!: string | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  lastLoginAt!: Date | null;

  // Explicitly excluded fields (never exposed)
  passwordHash!: string;
  isBanned!: boolean;
  deletedAt!: Date | null;
  isActive!: boolean;

  constructor(partial: Partial<SafeUserDto>) {
    Object.assign(this, partial);
  }
}
