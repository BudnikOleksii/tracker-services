## Why

The auth service has solid fundamentals (JWT tokens, refresh token rotation, email verification, role-based access) but lacks hardening against common attack vectors. There is no account lockout after repeated failed login attempts, no password complexity enforcement beyond a minimum length, and no mechanism to detect or block suspicious authentication patterns. These gaps leave the system vulnerable to brute-force attacks and credential stuffing.

## What Changes

- Add account lockout after repeated failed login attempts with automatic unlock after a cooldown period
- Enforce password complexity rules (uppercase, lowercase, numbers, special characters)
- Track failed login attempts per account with timestamps for audit and detection
- Add password breach detection using the Have I Been Pwned k-anonymity API during registration and password changes
- Add suspicious login detection based on IP and User-Agent changes, notifying users of unrecognized sign-ins

## Capabilities

### New Capabilities

- `brute-force-protection`: Account lockout after N failed attempts, failed attempt tracking, automatic cooldown unlock
- `password-policy`: Password complexity rules (character classes, breach detection via HIBP k-anonymity API)
- `suspicious-login-detection`: Detect logins from new IPs/devices and notify users via email

### Modified Capabilities

## Impact

- **Auth Service**: New logic in login flow for lockout checks, failed attempt tracking, password validation, and login anomaly detection
- **Database**: New `login_attempts` table for tracking failed attempts; new `known_devices` table for trusted device tracking
- **API Gateway**: Password validation rules applied to register and any future password-change endpoints
- **Email**: New email template for suspicious login notifications
- **External Dependencies**: HTTP client for HIBP k-anonymity API calls
