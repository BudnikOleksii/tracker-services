## ADDED Requirements

### Requirement: Enforce password complexity rules

The system SHALL require passwords to contain at least one uppercase letter, one lowercase letter, one digit, and one special character, in addition to the existing 8-character minimum length.

#### Scenario: Password meets all complexity requirements

- **WHEN** a user registers with password "Tr@cker1"
- **THEN** the system accepts the password

#### Scenario: Password missing uppercase letter

- **WHEN** a user registers with password "tr@cker1"
- **THEN** the system rejects the password with a validation error listing the missing requirement

#### Scenario: Password missing special character

- **WHEN** a user registers with password "Tracker1"
- **THEN** the system rejects the password with a validation error listing the missing requirement

#### Scenario: Password missing digit

- **WHEN** a user registers with password "Tr@ckerr"
- **THEN** the system rejects the password with a validation error listing the missing requirement

#### Scenario: Password missing lowercase letter

- **WHEN** a user registers with password "TR@CKER1"
- **THEN** the system rejects the password with a validation error listing the missing requirement

### Requirement: Reject breached passwords via HIBP k-anonymity API

The system SHALL check passwords against the Have I Been Pwned Passwords API using the k-anonymity model during registration. Only the first 5 characters of the SHA-1 hash SHALL be sent to the API.

#### Scenario: Password found in breach database

- **WHEN** a user registers with a password whose SHA-1 hash is found in the HIBP database
- **THEN** the system rejects the registration with an error indicating the password has appeared in a data breach

#### Scenario: Password not found in breach database

- **WHEN** a user registers with a password whose SHA-1 hash is not found in the HIBP response
- **THEN** the system allows registration to proceed

#### Scenario: HIBP API is unreachable

- **WHEN** the HIBP API call fails or times out
- **THEN** the system allows registration to proceed (fail open)
- **AND** logs a warning about the HIBP check failure

### Requirement: Password validation errors are descriptive

The system SHALL return specific validation error messages indicating which complexity rules the password fails to meet.

#### Scenario: Multiple rules violated

- **WHEN** a user registers with password "password"
- **THEN** the system returns validation errors listing all unmet requirements (missing uppercase, digit, and special character)
