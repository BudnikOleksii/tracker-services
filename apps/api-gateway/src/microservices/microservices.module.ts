import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { GatewayConfigService } from '../config/gateway-config.service';
import { SERVICES } from '../constants/services.constant';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.AUTH,
        inject: [GatewayConfigService],
        useFactory: (config: GatewayConfigService) => ({
          transport: Transport.TCP,
          options: config.services['AUTH_SERVICE'],
        }),
      },
      {
        name: SERVICES.EXPENSES,
        inject: [GatewayConfigService],
        useFactory: (config: GatewayConfigService) => ({
          transport: Transport.TCP,
          options: config.services['EXPENSES_SERVICE'],
        }),
      },
      {
        name: SERVICES.USERS,
        inject: [GatewayConfigService],
        useFactory: (config: GatewayConfigService) => ({
          transport: Transport.TCP,
          options: config.services['USERS_SERVICE'],
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MicroservicesModule {}
