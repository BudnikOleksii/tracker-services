## ADDED Requirements

### Requirement: Track known devices per user

The system SHALL maintain a record of known devices for each user, identified by the combination of IP address and User-Agent string. The system SHALL record the first-seen and last-seen timestamps for each device.

#### Scenario: First login from a device

- **WHEN** a user logs in successfully from an IP and User-Agent combination not previously recorded
- **THEN** the system creates a known device record with the current timestamp as both `firstSeenAt` and `lastSeenAt`

#### Scenario: Subsequent login from a known device

- **WHEN** a user logs in successfully from a previously recorded IP and User-Agent combination
- **THEN** the system updates the `lastSeenAt` timestamp on the existing device record

### Requirement: Notify user of unrecognized device login

The system SHALL send an email notification to the user when a successful login occurs from an unrecognized device.

#### Scenario: Email sent for new device login

- **WHEN** a user logs in from an unrecognized device
- **THEN** the system sends an email to the user's registered email address containing the IP address, User-Agent, and timestamp of the login

#### Scenario: No email for known device login

- **WHEN** a user logs in from a previously recognized device
- **THEN** the system does not send a suspicious login notification email

#### Scenario: Email sending fails

- **WHEN** the suspicious login notification email fails to send
- **THEN** the login still succeeds (notification is fire-and-forget)
- **AND** the system logs an error about the failed notification

### Requirement: Suspicious login detection is configurable

The system SHALL allow suspicious login detection to be enabled or disabled via the `AUTH_SUSPICIOUS_LOGIN_ENABLED` environment variable.

#### Scenario: Feature disabled

- **WHEN** `AUTH_SUSPICIOUS_LOGIN_ENABLED` is set to `false`
- **THEN** the system skips device tracking and does not send suspicious login notifications

#### Scenario: Feature enabled by default

- **WHEN** `AUTH_SUSPICIOUS_LOGIN_ENABLED` is not set
- **THEN** the system enables suspicious login detection by default
