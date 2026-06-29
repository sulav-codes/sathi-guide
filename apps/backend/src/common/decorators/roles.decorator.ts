import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
export const ROLES_KEY = 'roles';

/**
 * Specify which roles are allowed to access a route.
 * Must be used in conjunction with RolesGuard.
 *
 * @example
 * @Roles(Role.ADMIN, Role.GUIDE)
 * @Get('protected')
 * protectedRoute() {}
 */
export const Roles = (...roles: Role[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
