import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Environment, type AppConfig } from './app.config';
import { type CacheConfig } from './cache.config';
import { type DatabaseConfig } from './database.config';
import { type EmailConfig } from './email.config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get app(): AppConfig {
    const config = this.configService.get<AppConfig>('app');
    if (!config) {
      throw new Error('App configuration is not available');
    }

    return config;
  }

  get database(): DatabaseConfig {
    const config = this.configService.get<DatabaseConfig>('database');
    if (!config) {
      throw new Error('Database configuration is not available');
    }

    return config;
  }

  get cache(): CacheConfig {
    const config = this.configService.get<CacheConfig>('cache');
    if (!config) {
      throw new Error('Cache configuration is not available');
    }

    return config;
  }

  get email(): EmailConfig {
    const config = this.configService.get<EmailConfig>('email');
    if (!config) {
      throw new Error('Email configuration is not available');
    }

    return config;
  }

  get isDevelopment(): boolean {
    return this.app.env === Environment.Development;
  }

  get isProduction(): boolean {
    return this.app.env === Environment.Production;
  }

  get isTest(): boolean {
    return this.app.env === Environment.Test;
  }
}
