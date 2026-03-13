## 1. Database Schema

- [x] 1.1 Create `login_attempts` table schema in `packages/database/src/schema/` with columns: id, userId (FK), ipAddress, userAgent, attemptedAt, successful. Add index on (userId, attemptedAt)
- [x] 1.2 Create `known_devices` table schema in `packages/database/src/schema/` with columns: id, userId (FK), ipAddress, userAgent, firstSeenAt, lastSeenAt. Add unique constraint on (userId, ipAddress, userAgent)
- [x] 1.3 Export new schemas from the database package barrel file
- [x] 1.4 Generate and run Drizzle migration for the new tables

## 2. Auth Configuration

- [x] 2.1 Add new environment variables to `auth.config.ts` Joi schema: AUTH_MAX_FAILED_ATTEMPTS (default 5), AUTH_LOCKOUT_BASE_MINUTES (default 1), AUTH_SUSPICIOUS_LOGIN_ENABLED (default true)
- [x] 2.2 Expose new config values via `AuthConfigService` with getter methods

## 3. Password Policy

- [x] 3.1 Create password complexity validator in `packages/shared/` that checks for uppercase, lowercase, digit, and special character requirements
- [x] 3.2 Update the register DTO in `apps/api-gateway/src/auth/dto/register.dto.ts` to use the new password complexity validator
- [x] 3.3 Create HIBP k-anonymity service in `apps/auth-service/src/auth/` that checks SHA-1 hash prefix against the HIBP Passwords API
- [x] 3.4 Add `@nestjs/axios` dependency to auth-service and configure HttpModule
- [x] 3.5 Integrate HIBP check into the registration flow in `auth.service.ts` with fail-open behavior

## 4. Brute-Force Protection

- [x] 4.1 Create `login-attempts.repository.ts` in `apps/auth-service/src/auth/repositories/` with methods: recordAttempt, getRecentFailedAttempts, getConsecutiveFailedCount
- [x] 4.2 Create lockout service in `apps/auth-service/src/auth/` that calculates lockout status and progressive cooldown duration
- [x] 4.3 Integrate lockout check into the login flow in `auth.service.ts` — check before credential validation, record attempts after
- [x] 4.4 Return 429 with retryAfter when account is locked

## 5. Suspicious Login Detection

- [x] 5.1 Create `known-devices.repository.ts` in `apps/auth-service/src/auth/repositories/` with methods: findDevice, upsertDevice
- [x] 5.2 Create suspicious login detection service that checks if device is known and triggers email notification for new devices
- [x] 5.3 Create email template for suspicious login notification (IP, User-Agent, timestamp)
- [x] 5.4 Integrate device check into the login flow after successful authentication, with fire-and-forget email sending
- [x] 5.5 Gate the feature behind the AUTH_SUSPICIOUS_LOGIN_ENABLED config flag

## 6. Module Wiring

- [x] 6.1 Register new repositories, services, and HttpModule in `auth.module.ts`
- [x] 6.2 Update auth service barrel exports if needed

## 7. Testing

- [x] 7.1 Add unit tests for password complexity validator
- [x] 7.2 Add unit tests for lockout service (progressive cooldown calculation, lockout status)
- [x] 7.3 Add unit tests for HIBP service (breach found, not found, API failure)
- [x] 7.4 Add unit tests for suspicious login detection service
- [x] 7.5 Add integration tests for login flow with lockout scenarios
