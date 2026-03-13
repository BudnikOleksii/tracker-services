import * as Joi from 'joi';

export interface AuthConfig {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  maxFailedAttempts: number;
  lockoutBaseMinutes: number;
  suspiciousLoginEnabled: boolean;
}

export const authConfigSchema = Joi.object<AuthConfig>({
  jwtAccessSecret: Joi.string().min(1).required(),
  jwtRefreshSecret: Joi.string().min(1).required(),
  jwtAccessExpiresIn: Joi.string().min(1).required(),
  jwtRefreshExpiresIn: Joi.string().min(1).required(),
  maxFailedAttempts: Joi.number().integer().min(1).required(),
  lockoutBaseMinutes: Joi.number().integer().min(1).required(),
  suspiciousLoginEnabled: Joi.boolean().required(),
});
