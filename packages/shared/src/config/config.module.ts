import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import appConfigFactory from './app.config.factory';
import cacheConfigFactory from './cache.config.factory';
import databaseConfigFactory from './database.config.factory';
import emailConfigFactory from './email.config.factory';
import { AppConfigService } from './app-config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfigFactory,
        databaseConfigFactory,
        cacheConfigFactory,
        emailConfigFactory,
      ],
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
