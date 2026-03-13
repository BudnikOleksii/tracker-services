import { registerAs } from '@nestjs/config';

import { authConfigSchema, type AuthConfig } from './auth.config';

export default registerAs<AuthConfig>('auth', () => {
  const value = authConfigSchema.validate(
    {
      jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
      jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      maxFailedAttempts: Number(process.env.AUTH_MAX_FAILED_ATTEMPTS ?? 5),
      lockoutBaseMinutes: Number(process.env.AUTH_LOCKOUT_BASE_MINUTES ?? 1),
      suspiciousLoginEnabled:
        (process.env.AUTH_SUSPICIOUS_LOGIN_ENABLED ?? 'true') === 'true',
    },
    {
      abortEarly: false,
    },
  );

  if (value.error) {
    throw value.error;
  }

  return value.value;
});
