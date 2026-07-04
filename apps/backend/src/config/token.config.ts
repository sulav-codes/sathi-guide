import { registerAs } from '@nestjs/config';
import { TokenConfig } from '../common/types/config.types';

export const TOKEN_CONFIG_KEY = 'token';

export default registerAs(TOKEN_CONFIG_KEY, (): TokenConfig => ({
  refreshTokenExpiresInDays: parseInt(
    process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? '7',
    10,
  ),
  resetTokenExpiresInMinutes: parseInt(
    process.env.RESET_TOKEN_EXPIRES_IN_MINUTES ?? '60',
    10,
  ),
  verificationTokenExpiresInMinutes: parseInt(
    process.env.VERIFICATION_TOKEN_EXPIRES_IN_MINUTES ?? '1440',
    10,
  ),
  resendVerificationCooldownSeconds: parseInt(
    process.env.RESEND_VERIFICATION_COOLDOWN_SECONDS ?? '60',
    10,
  ),
}));
