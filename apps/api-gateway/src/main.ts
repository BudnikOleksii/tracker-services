import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import {
  AppConfigService,
  createSwaggerDocumentBuilder,
} from '@tracker/shared';

import { AppModule } from './app.module';
import { GatewayConfigService } from './config/gateway-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const appConfigService = app.get(AppConfigService);
  const gatewayConfigService = app.get(GatewayConfigService);

  app.setGlobalPrefix(appConfigService.app.apiPrefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: gatewayConfigService.gateway.apiVersion,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    credentials: true,
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (
        !origin ||
        gatewayConfigService.gateway.allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  });

  if (!appConfigService.isProduction) {
    const config = createSwaggerDocumentBuilder(appConfigService)
      .addBearerAuth(undefined, 'JWT-auth')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      gatewayConfigService.gateway.swaggerPath,
      app,
      document,
    );
  }

  await app.listen(
    appConfigService.app.port,
    gatewayConfigService.gateway.host,
  );
}

void bootstrap();
