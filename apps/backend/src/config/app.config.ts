import { registerAs } from '@nestjs/config';
import { AppConfig } from '../common/types/config.types';

export const APP_CONFIG_KEY = 'app';

export default registerAs(
  APP_CONFIG_KEY,
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '8000', 10),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  }),
);
