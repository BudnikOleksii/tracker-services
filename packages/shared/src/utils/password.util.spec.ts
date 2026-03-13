import { describe, it, expect } from 'vitest';

import { validatePasswordComplexity } from './password.util';

describe('validatePasswordComplexity', () => {
  it('should accept a password meeting all requirements', () => {
    const result = validatePasswordComplexity('Tr@cker1');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject a password missing an uppercase letter', () => {
    const result = validatePasswordComplexity('tr@cker1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one uppercase letter',
    );
  });

  it('should reject a password missing a lowercase letter', () => {
    const result = validatePasswordComplexity('TR@CKER1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one lowercase letter',
    );
  });

  it('should reject a password missing a digit', () => {
    const result = validatePasswordComplexity('Tr@ckerr');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one digit');
  });

  it('should reject a password missing a special character', () => {
    const result = validatePasswordComplexity('Tracker1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one special character',
    );
  });

  it('should reject a password shorter than 8 characters', () => {
    const result = validatePasswordComplexity('Tr@1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Password must be at least 8 characters long',
    );
  });

  it('should return all errors for a password violating multiple rules', () => {
    const result = validatePasswordComplexity('password');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one uppercase letter',
    );
    expect(result.errors).toContain('Password must contain at least one digit');
    expect(result.errors).toContain(
      'Password must contain at least one special character',
    );
  });
});
