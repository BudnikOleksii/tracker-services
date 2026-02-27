import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  AppConfigService,
  CoreModule,
  appConfigFactory,
} from '@tracker/shared';

import gatewayConfigFactory from './config/gateway.config.factory';
import { GatewayConfigService } from './config/gateway-config.service';
import { SERVICES } from './constants/services.constant';
import { RpcExceptionInterceptor } from './filters/rpc-exception.interceptor';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory, gatewayConfigFactory],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    CoreModule,
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
    AuthModule,
    ExpensesModule,
    UsersModule,
  ],
  providers: [
    AppConfigService,
    GatewayConfigService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcExceptionInterceptor,
    },
  ],
})
export class AppModule {}
