import * as Joi from 'joi';

import { SERVICES, Service } from '../constants/services.constant';

interface ServiceConfig {
  host: string;
  port: number;
}

export interface GatewayConfig {
  host: string;
  allowedOrigins: string[];
  swaggerPath: string;
  apiVersion: string;
  jwtAccessSecret: string;
  services: Record<Service, ServiceConfig>;
}

const serviceSchema = Joi.object<ServiceConfig>({
  host: Joi.string().required(),
  port: Joi.number().integer().min(1).required(),
}).required();

const servicesSchema = Joi.object<Record<Service, ServiceConfig>>({
  [SERVICES.AUTH]: serviceSchema,
  [SERVICES.EXPENSES]: serviceSchema,
  [SERVICES.USERS]: serviceSchema,
}).required();

export const gatewayConfigSchema = Joi.object<GatewayConfig>({
  host: Joi.string().required(),
  allowedOrigins: Joi.array().items(Joi.string()).required(),
  swaggerPath: Joi.string().required(),
  apiVersion: Joi.string().required(),
  jwtAccessSecret: Joi.string().min(1).required(),
  services: servicesSchema,
});
