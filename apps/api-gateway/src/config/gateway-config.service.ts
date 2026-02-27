import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { type GatewayConfig } from './gateway.config';

@Injectable()
export class GatewayConfigService {
  constructor(private readonly configService: ConfigService) {}

  get gateway(): GatewayConfig {
    const config = this.configService.get<GatewayConfig>('gateway');
    if (!config) {
      throw new Error('Gateway configuration is not available');
    }

    return config;
  }

  get jwtAccessSecret(): string {
    return this.gateway.jwtAccessSecret;
  }

  get services(): GatewayConfig['services'] {
    return this.gateway.services;
  }
}
