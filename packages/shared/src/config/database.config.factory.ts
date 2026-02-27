import { registerAs } from '@nestjs/config';

import { databaseConfigSchema, type DatabaseConfig } from './database.config';

export default registerAs<DatabaseConfig>('database', () => {
  const value = databaseConfigSchema.validate(
    {
      url: process.env.DATABASE_URL,
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
