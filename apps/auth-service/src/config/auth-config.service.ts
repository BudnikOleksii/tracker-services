import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { type AuthConfig } from './auth.config';

@Injectable()
export class AuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  get auth(): AuthConfig {
    const config = this.configService.get<AuthConfig>('auth');
    if (!config) {
      throw new Error('Auth configuration is not available');
    }

    return config;
  }

  get jwtAccessSecret(): string {
    return this.auth.jwtAccessSecret;
  }

  get jwtRefreshSecret(): string {
    return this.auth.jwtRefreshSecret;
  }

  get jwtAccessExpiresIn(): string {
    return this.auth.jwtAccessExpiresIn;
  }

  get jwtRefreshExpiresIn(): string {
    return this.auth.jwtRefreshExpiresIn;
  }
}
