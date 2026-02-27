import { registerAs } from '@nestjs/config';

import { Environment, appConfigSchema, type AppConfig } from './app.config';

export default registerAs<AppConfig>('app', () => {
  const value = appConfigSchema.validate(
    {
      env: (process.env.NODE_ENV as Environment) ?? Environment.Development,
      port: process.env.PORT ? Number(process.env.PORT) : 3000,
      apiPrefix: process.env.API_PREFIX ?? 'api',
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
