## ADDED Requirements

### Requirement: Track failed login attempts

The system SHALL record every failed login attempt with the user ID, IP address, User-Agent, and timestamp. The system SHALL record successful login attempts to support lockout reset logic.

#### Scenario: Failed login attempt is recorded

- **WHEN** a user submits invalid credentials
- **THEN** the system stores a login attempt record with `successful: false`, the user's ID, requesting IP address, User-Agent, and current timestamp

#### Scenario: Successful login attempt is recorded

- **WHEN** a user submits valid credentials and passes all checks
- **THEN** the system stores a login attempt record with `successful: true`

### Requirement: Lock account after consecutive failed attempts

The system SHALL deny login attempts when the account has reached the maximum number of consecutive failed attempts within the lockout window. The default maximum SHALL be 5 consecutive failed attempts.

#### Scenario: Account is locked after 5 consecutive failures

- **WHEN** a user has 5 consecutive failed login attempts with no successful attempt in between
- **AND** the lockout cooldown period has not elapsed
- **THEN** the system rejects the login with a 429 status and a message indicating the account is temporarily locked
- **AND** the response includes a `retryAfter` value in seconds

#### Scenario: Account lockout resets after successful login

- **WHEN** a user successfully logs in
- **THEN** the consecutive failed attempt counter resets to zero for that account

#### Scenario: Account unlocks after cooldown period

- **WHEN** the lockout cooldown period has elapsed since the last failed attempt
- **THEN** the system allows login attempts again

### Requirement: Progressive lockout cooldown

The system SHALL apply progressive cooldown periods that increase with repeated lockouts. The base cooldown SHALL default to 1 minute and double with each subsequent lockout, capped at 30 minutes.

#### Scenario: First lockout applies base cooldown

- **WHEN** an account is locked out for the first time
- **THEN** the cooldown period is 1 minute

#### Scenario: Repeated lockouts double the cooldown

- **WHEN** an account is locked out for the Nth consecutive time without a successful login in between
- **THEN** the cooldown period is `min(base * 2^(N-1), 30 minutes)`

#### Scenario: Successful login resets progressive cooldown

- **WHEN** a user successfully logs in after a lockout
- **THEN** the lockout tier resets and the next lockout (if any) starts at the base cooldown

### Requirement: Lockout parameters are configurable

The system SHALL allow configuration of the maximum failed attempts and base lockout duration via environment variables.

#### Scenario: Custom lockout configuration

- **WHEN** `AUTH_MAX_FAILED_ATTEMPTS` is set to 10 and `AUTH_LOCKOUT_BASE_MINUTES` is set to 2
- **THEN** the system locks accounts after 10 consecutive failed attempts with a base cooldown of 2 minutes

#### Scenario: Default configuration

- **WHEN** no lockout environment variables are set
- **THEN** the system uses 5 max failed attempts and 1-minute base cooldown
