import { registerAs } from '@nestjs/config';

import { cacheConfigSchema, type CacheConfig } from './cache.config';

export default registerAs<CacheConfig>('cache', () => {
  const value = cacheConfigSchema.validate(
    {
      url: process.env.CACHE_URL,
      ttlSeconds: process.env.CACHE_TTL_SECONDS
        ? Number(process.env.CACHE_TTL_SECONDS)
        : 300,
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
