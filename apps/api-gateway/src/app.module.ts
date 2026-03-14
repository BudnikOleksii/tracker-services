import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  AppConfigService,
  CoreModule,
  appConfigFactory,
} from '@tracker/shared';

import gatewayConfigFactory from './config/gateway.config.factory';
import { GatewayConfigModule } from './config/gateway-config.module';
import { RpcExceptionInterceptor } from './filters/rpc-exception.interceptor';
import { MicroservicesModule } from './microservices/microservices.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { UsersModule } from './users/users.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory, gatewayConfigFactory],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    CoreModule,
    GatewayConfigModule,
    MicroservicesModule,
    AuthModule,
    ExpensesModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [
    AppConfigService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcExceptionInterceptor,
    },
  ],
})
export class AppModule {}
