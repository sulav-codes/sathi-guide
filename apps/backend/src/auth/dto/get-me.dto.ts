export class GetMeDto {
  id!: string;
  email!: string;
  phone!: string | null;
  role!: string;
  isEmailVerified!: boolean;
  isPhoneVerified!: boolean;
  avatarId!: string | null;
  createdAt!: string;
  lastLoginAt!: string | null;
}
