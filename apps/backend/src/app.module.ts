import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TRPCModule.forRoot({
      basePath: '/trpc',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
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
