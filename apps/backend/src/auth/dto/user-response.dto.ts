export class UserResponseDto {
  id!: string;
  email!: string;
  phone!: string | null;
  role!: string;
  isEmailVerified!: boolean;
  isPhoneVerified!: boolean;
  avatarKey!: string | null;
  createdAt!: string;
  lastLoginAt!: string | null;
}
