import * as Joi from 'joi';

export enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export interface AppConfig {
  env: Environment;
  port: number;
  apiPrefix: string;
}

export const appConfigSchema = Joi.object<AppConfig>({
  env: Joi.string()
    .valid(Environment.Development, Environment.Test, Environment.Production)
    .required(),
  port: Joi.number().integer().min(1).required(),
  apiPrefix: Joi.string().min(1).required(),
});
