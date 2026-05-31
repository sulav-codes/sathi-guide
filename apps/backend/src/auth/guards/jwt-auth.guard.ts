import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is decorated with @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: Error | null,
    user: TUser | false,
    info: { message?: string } | Error | undefined,
    ctx: ExecutionContext,
  ): TUser {
    void ctx;
    if (err || !user) {
      const message = this.resolveAuthErrorMessage(err, info);
      this.logger.warn(`JWT authentication failed: ${message}`);
      throw new UnauthorizedException(message);
    }

    return user;
  }

  private resolveAuthErrorMessage(
    err: Error | null,
    info: { message?: string } | Error | undefined,
  ): string {
    if (err) return err.message;

    if (info instanceof Error) {
      if (info.name === 'TokenExpiredError') {
        return 'Access token has expired. Please refresh your session.';
      }
      if (info.name === 'JsonWebTokenError') {
        return 'Invalid access token. Please log in again.';
      }
      if (info.name === 'NotBeforeError') {
        return 'Token is not yet valid.';
      }
      return info.message ?? 'Authentication failed';
    }

    if (info && typeof info === 'object' && 'message' in info) {
      return info.message ?? 'Authentication failed';
    }

    return 'Authentication required. Please provide a valid token.';
  }
}
