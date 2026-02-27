import { registerAs } from '@nestjs/config';

import { authConfigSchema, type AuthConfig } from './auth.config';

export default registerAs<AuthConfig>('auth', () => {
  const value = authConfigSchema.validate(
    {
      jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
      jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
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
