import * as Joi from 'joi';

export interface DatabaseConfig {
  url: string;
}

export const databaseConfigSchema = Joi.object<DatabaseConfig>({
  url: Joi.string().uri().required(),
});
