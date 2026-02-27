import { SetMetadata } from '@nestjs/common';
import { userRoleEnum } from '@tracker/database';

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
