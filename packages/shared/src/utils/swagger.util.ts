import { DocumentBuilder } from '@nestjs/swagger';

import { AppConfigService } from '../config/app-config.service';

export const createSwaggerDocumentBuilder = (
  appConfigService: AppConfigService,
): DocumentBuilder => {
  const appConfig = appConfigService.app;

  return new DocumentBuilder()
    .setTitle('Tracker API')
    .setDescription('Tracker API documentation')
    .setVersion('1.0.0')
    .addServer(`/${appConfig.apiPrefix}`);
};
