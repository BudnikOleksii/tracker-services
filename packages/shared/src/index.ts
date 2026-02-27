export { ConfigModule } from './config/config.module';
export { AppConfigService } from './config/app-config.service';
export type { AppConfig, Environment } from './config/app.config';
export type { DatabaseConfig } from './config/database.config';
export type { CacheConfig } from './config/cache.config';
export type { EmailConfig } from './config/email.config';
export { default as appConfigFactory } from './config/app.config.factory';
export { default as cacheConfigFactory } from './config/cache.config.factory';

export { CoreModule } from './core/core.module';
export { ERROR_MESSAGES } from './core/constants/error-messages.constant';
export { CurrentUser } from './core/decorators/current-user.decorator';
export { Public, IS_PUBLIC_KEY } from './core/decorators/public.decorator';
export { Roles, ROLES_KEY } from './core/decorators/roles.decorator';
export { GlobalExceptionFilter } from './core/filters/global-exception.filter';
export { JwtAuthGuard } from './core/guards/jwt-auth.guard';
export { RolesGuard } from './core/guards/roles.guard';
export { ResponseTransformInterceptor } from './core/interceptors/response-transform.interceptor';

export { SharedModule } from './shared.module';
export { EmailService } from './services/email.service';
export { PaginatedResponseDto } from './dto/paginated-response.dto';
export type {
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,
} from './types/response';
export type { Nullable, ObjectValuesUnion } from './types/utility';
export {
  isValidCurrencyCode,
  validateCurrencyCode,
} from './utils/currency.util';
export { formatDate, isValidDate, parseDate } from './utils/date.util';
export { createSwaggerDocumentBuilder } from './utils/swagger.util';
