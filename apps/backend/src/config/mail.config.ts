import { registerAs } from '@nestjs/config';
import { MailConfig } from '../common/types/config.types';

export const MAIL_CONFIG_KEY = 'mail';

export default registerAs(
  MAIL_CONFIG_KEY,
  (): MailConfig => ({
    fromName: process.env.MAIL_FROM_NAME ?? 'SathiGuide',
    fromAddress: process.env.MAIL_FROM_ADDRESS ?? 'noreply@sathiguide.com',
  }),
);
