import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@tracker/database';
import { ConfigModule, AppConfigService, SharedModule } from '@tracker/shared';

import authConfigFactory from './config/auth.config.factory';
import { AuthConfigService } from './config/auth-config.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [authConfigFactory],
    }),
    DatabaseModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        connectionString: config.database.url,
      }),
    }),
    SharedModule,
    AuthModule,
  ],
  providers: [AuthConfigService],
  exports: [AuthConfigService],
})
export class AppModule {}
