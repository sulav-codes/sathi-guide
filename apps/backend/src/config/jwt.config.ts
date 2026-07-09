import { registerAs } from '@nestjs/config';
import { JwtConfig } from '../common/types/config.types';

export const JWT_CONFIG_KEY = 'jwt';

export default registerAs(JWT_CONFIG_KEY, (): JwtConfig => ({
  secret: process.env.JWT_SECRET!,
  issuer: process.env.JWT_ISSUER ?? 'sathiguide-api',
  audience: process.env.JWT_AUDIENCE ?? 'sathiguide-client',
  accessExpiresIn:
    parseInt(process.env.JWT_ACCESS_EXPIRES_IN_MINUTES ?? '15') * 60,
}));
