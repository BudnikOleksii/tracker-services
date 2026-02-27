import { ObjectValuesUnion } from '@tracker/shared';

export const SERVICES = {
  AUTH: 'AUTH_SERVICE',
  EXPENSES: 'EXPENSES_SERVICE',
  USERS: 'USERS_SERVICE',
} as const;

export type Service = ObjectValuesUnion<typeof SERVICES>;
