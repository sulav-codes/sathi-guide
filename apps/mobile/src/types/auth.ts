export type UserRole = "TOURIST" | "GUIDE" | "ADMIN";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatarId: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  gender?: Gender;
  // Tourist fields
  nationality?: string;
  preferredLanguage?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  // Guide fields
  experienceYears?: number;
  languagesSpoken?: string[];
  hasGuideLicense?: boolean;
  licenseNumber?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  phone?: string;
  experienceYears?: string;
  languages?: string;
  gender?: string;
  nationality?: string;
  preferredLanguage?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  terms?: string;
  general?: string;
}

export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  phone?: string;
  experienceYears?: string;
  languages?: string[];
  gender?: Gender;
  nationality?: string;
  preferredLanguage?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}
