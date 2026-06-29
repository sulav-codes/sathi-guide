import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '../../generated/prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  /** Subject — User ID (cuid) */
  sub: string;
  /** User email */
  email: string;
  /** User role */
  role: Role;
  /** JWT ID — unique per token (cuid), enables per-token revocation */
  jti: string;
  /** Issued at (Unix timestamp) */
  iat?: number;
  /** Expiration (Unix timestamp) */
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const { sub: userId } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isBanned: true,
        deletedAt: true,
      },
    });

    if (!user) {
      this.logger.warn(
        `JWT validation failed: user ${userId} not found in database`,
      );
      throw new UnauthorizedException(
        'Account not found. Please log in again.',
      );
    }

    if (user.deletedAt !== null) {
      this.logger.warn(
        `JWT validation failed: user ${userId} account has been deleted`,
      );
      throw new UnauthorizedException(
        'Account has been deleted. Please contact support.',
      );
    }

    if (!user.isActive) {
      this.logger.warn(
        `JWT validation failed: user ${userId} account is deactivated`,
      );
      throw new UnauthorizedException(
        'Account is deactivated. Please contact support.',
      );
    }

    if (user.isBanned) {
      this.logger.warn(`JWT validation failed: user ${userId} is banned`);
      throw new UnauthorizedException(
        'Account has been suspended. Please contact support.',
      );
    }

    return payload;
  }
}
