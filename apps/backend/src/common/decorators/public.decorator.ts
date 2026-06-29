import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public — JwtAuthGuard will skip authentication for it.
 *
 * @example
 * @Public()
 * @Post('register')
 * register(@Body() dto: RegisterDto) {}
 */
export const Public = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC_KEY, true);
