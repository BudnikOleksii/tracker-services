## Context

The auth service uses NestJS microservices (TCP transport) with JWT access/refresh tokens, bcrypt password hashing (12 rounds), email verification, and role-based access control. Rate limiting exists at the API Gateway level (5 req/min on login/register, 100 req/min global). However, there is no per-account brute-force protection, no password complexity enforcement beyond 8-character minimum, and no mechanism to detect logins from unfamiliar devices.

The auth service lives at `apps/auth-service/` with the HTTP layer in `apps/api-gateway/src/auth/`. Database schemas use Drizzle ORM with PostgreSQL (`packages/database/`). Shared guards, decorators, and DTOs are in `packages/shared/`.

## Goals / Non-Goals

**Goals:**

- Prevent brute-force and credential-stuffing attacks via per-account lockout
- Enforce strong password policies including breach detection
- Alert users when their account is accessed from an unrecognized device/IP
- All new security features configurable via environment variables

**Non-Goals:**

- Full 2FA/MFA (TOTP, SMS) — separate initiative
- CAPTCHAs or bot detection at the gateway level
- Password rotation policies or password history tracking
- Real-time IP reputation scoring or geo-blocking

## Decisions

### 1. Account lockout strategy: time-based cooldown with progressive delays

Lock the account after 5 consecutive failed attempts. Cooldown starts at 1 minute and doubles with each subsequent lockout (1m → 2m → 4m → ..., capped at 30 minutes). Successful login resets the counter.

**Why over permanent lockout**: Permanent lockout enables denial-of-service by attackers deliberately locking victim accounts. Time-based cooldown balances security with availability.

**Why over just rate limiting**: Gateway rate limiting is per-IP. Credential stuffing uses distributed IPs, so per-account tracking is necessary.

**Implementation**: New `login_attempts` table tracking `userId`, `ipAddress`, `attemptedAt`, `successful`. The auth service checks recent failed attempts before validating credentials. Configuration via `AUTH_MAX_FAILED_ATTEMPTS` (default 5) and `AUTH_LOCKOUT_BASE_MINUTES` (default 1).

### 2. Password complexity: validation rules + HIBP k-anonymity check

Enforce: minimum 8 characters, at least one uppercase, one lowercase, one digit, one special character. Additionally, check the password's SHA-1 hash prefix against the Have I Been Pwned Passwords API (k-anonymity model — only first 5 chars of hash are sent).

**Why HIBP k-anonymity**: Does not expose the actual password or full hash to the external service. Prevents users from choosing commonly breached passwords.

**Why not zxcvbn**: HIBP covers real-world breaches; zxcvbn estimates entropy. HIBP is simpler to integrate and more directly addresses credential stuffing risk. Can add zxcvbn later if needed.

**Implementation**: Password validation as a shared utility in `packages/shared/` applied in the register DTO and any future password-change DTOs. HIBP check as an async service in `apps/auth-service/` called during registration. Use NestJS `HttpModule` (`@nestjs/axios`) for the HIBP API call.

### 3. Suspicious login detection: IP + User-Agent fingerprint tracking

Maintain a `known_devices` table with `userId`, `ipAddress`, `userAgent`, `firstSeenAt`, `lastSeenAt`. On each successful login, check if the IP+User-Agent combination is known. If not, send a notification email to the user and add the device to known devices.

**Why IP + User-Agent (not just IP)**: Users behind shared IPs (corporate, VPN) would get false alerts on IP alone. Combining with User-Agent reduces false positives while catching actual device changes.

**Why email notification (not blocking)**: Blocking unknown devices without 2FA would lock out legitimate users who switch devices. Email notification informs users without disrupting access.

**Implementation**: Device check happens in the login flow after successful credential validation. Email sent asynchronously (fire-and-forget) to avoid slowing login response. Configuration via `AUTH_SUSPICIOUS_LOGIN_ENABLED` (default true).

### 4. Database schema additions

Two new tables in `packages/database/src/schema/`:

- **`login_attempts`**: `id`, `userId` (FK → users), `ipAddress`, `userAgent`, `attemptedAt`, `successful` (boolean). Indexed on `(userId, attemptedAt)` for efficient lockout queries.
- **`known_devices`**: `id`, `userId` (FK → users), `ipAddress`, `userAgent`, `firstSeenAt`, `lastSeenAt`. Unique constraint on `(userId, ipAddress, userAgent)`.

### 5. Configuration approach: extend existing auth config

Add new environment variables to the existing `auth.config.ts` Joi schema and `AuthConfigService`. All security features have sensible defaults and can be toggled/tuned without code changes.

## Risks / Trade-offs

- **HIBP API availability** → If the HIBP API is unreachable, fail open (allow registration) and log a warning. Do not block user registration due to an external service outage.
- **Login latency increase** → The lockout check adds one DB query and suspicious login detection adds another. Both are indexed lookups (<5ms). HIBP adds ~100-200ms to registration only, not login.
- **Storage growth from login_attempts** → Implement a cleanup job or retention policy (e.g., delete attempts older than 30 days). Not in initial scope but should be added soon.
- **Email deliverability for suspicious login alerts** → Relies on existing nodemailer setup. If email delivery is unreliable, alerts may not reach users. Not a blocker for initial implementation.
