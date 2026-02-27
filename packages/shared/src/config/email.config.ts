import * as Joi from 'joi';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

export const emailConfigSchema = Joi.object<EmailConfig>({
  host: Joi.string().hostname().required(),
  port: Joi.number().integer().min(1).required(),
  secure: Joi.boolean().required(),
  user: Joi.string().required(),
  password: Joi.string().required(),
  from: Joi.string().email().required(),
});
