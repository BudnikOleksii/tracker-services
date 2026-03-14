import { Global, Module } from '@nestjs/common';

import { GatewayConfigService } from './gateway-config.service';

@Global()
@Module({
  providers: [GatewayConfigService],
  exports: [GatewayConfigService],
})
export class GatewayConfigModule {}
