export interface AppConfig {
  nodeEnv: string;
  port: number;
  frontendUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

export interface JwtConfig {
  secret: string;
  issuer: string;
  audience: string;
  accessExpiresIn: number;
}

export interface TokenConfig {
  refreshTokenExpiresInDays: number;
  resetTokenExpiresInMinutes: number;
  verificationTokenExpiresInMinutes: number;
  resendVerificationCooldownSeconds: number;
}

export interface MailConfig {
  fromName: string;
  fromAddress: string;
}
