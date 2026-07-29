import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  // ── App ──────────────────────────────────────────────────────────
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000;

  @IsUrl({ require_tld: false })
  FRONTEND_URL!: string;

  // ── Database ─────────────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  // ── JWT ──────────────────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_ISSUER: string = 'sathiguide-api';

  @IsString()
  @IsOptional()
  JWT_AUDIENCE: string = 'sathiguide-client';

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  // ── Tokens ───────────────────────────────────────────────────────
  @IsInt()
  @Min(1)
  @Max(90)
  @IsOptional()
  REFRESH_TOKEN_EXPIRES_IN_DAYS: number = 7;

  @IsInt()
  @Min(5)
  @Max(1440)
  @IsOptional()
  RESET_TOKEN_EXPIRES_IN_MINUTES: number = 60;

  @IsInt()
  @Min(5)
  @Max(1440)
  @IsOptional()
  VERIFICATION_TOKEN_EXPIRES_IN_MINUTES: number = 60;

  // ── Mail ─────────────────────────────────────────────────────────
  @IsString()
  @IsOptional()
  MAIL_FROM_NAME: string = 'SathiGuide';

  @IsString()
  @IsOptional()
  MAIL_FROM_ADDRESS: string = 'noreply@sathiguide.com';

  // ── Supabase Storage ─────────────────────────────────────────────
  @IsUrl({ require_tld: false })
  SUPABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  SUPABASE_SERVICE_ROLE_KEY!: string;

  @IsString()
  @IsOptional()
  SUPABASE_BUCKET: string = 'sathi-media';
}

export function validateConfig(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('\n');

    throw new Error(
      `Configuration validation failed:\n${messages}\n\nCheck your .env file.`,
    );
  }

  return validatedConfig;
}
