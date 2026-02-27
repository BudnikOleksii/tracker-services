import * as Joi from 'joi';

export interface CacheConfig {
  url: string;
  ttlSeconds: number;
}

export const cacheConfigSchema = Joi.object<CacheConfig>({
  url: Joi.string().uri().required(),
  ttlSeconds: Joi.number().integer().min(0).required(),
});
