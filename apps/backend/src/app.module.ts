import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import { validateConfig } from './config/config.validation';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import tokenConfig from './config/token.config';

@Module({
  imports: [
    TRPCModule.forRoot({
      basePath: '/trpc',
    }),
    ConfigModule.forRoot({
      isGlobal: true, // No need to import ConfigModule in every module
      cache: true, // Cache config reads for performance
      expandVariables: true, // Support ${VAR} syntax in .env
      validate: validateConfig, // Validate + coerce on startup — fail fast
      load: [appConfig, jwtConfig, mailConfig, tokenConfig],
    }),
    // Global rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60000'),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '10'),
      },
    ]),
    PrismaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    Reflector,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
