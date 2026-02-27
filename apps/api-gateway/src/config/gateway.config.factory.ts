import { registerAs } from '@nestjs/config';

import { gatewayConfigSchema, type GatewayConfig } from './gateway.config';

export default registerAs<GatewayConfig>('gateway', () => {
  const value = gatewayConfigSchema.validate(
    {
      host: process.env.HOST ?? '0.0.0.0',
      allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : [],
      swaggerPath: process.env.SWAGGER_PATH ?? 'docs',
      apiVersion: process.env.API_VERSION ?? '1',
      jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
      services: {
        auth: {
          host: process.env.AUTH_SERVICE_HOST ?? 'localhost',
          port: process.env.AUTH_SERVICE_PORT
            ? Number(process.env.AUTH_SERVICE_PORT)
            : 3001,
        },
        expenses: {
          host: process.env.EXPENSES_SERVICE_HOST ?? 'localhost',
          port: process.env.EXPENSES_SERVICE_PORT
            ? Number(process.env.EXPENSES_SERVICE_PORT)
            : 3002,
        },
        users: {
          host: process.env.USERS_SERVICE_HOST ?? 'localhost',
          port: process.env.USERS_SERVICE_PORT
            ? Number(process.env.USERS_SERVICE_PORT)
            : 3003,
        },
      },
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
