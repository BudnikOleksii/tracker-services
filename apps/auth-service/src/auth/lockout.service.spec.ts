import { describe, it, expect, vi, beforeEach } from 'vitest';

import { LockoutService } from './lockout.service';
import { LoginAttemptsRepository } from './repositories/login-attempts.repository';
import { AuthConfigService } from '../config/auth-config.service';

describe('LockoutService', () => {
  let lockoutService: LockoutService;
  let loginAttemptsRepository: {
    getConsecutiveFailedCount: ReturnType<typeof vi.fn>;
    getRecentFailedAttempts: ReturnType<typeof vi.fn>;
    recordAttempt: ReturnType<typeof vi.fn>;
  };
  let authConfigService: {
    maxFailedAttempts: number;
    lockoutBaseMinutes: number;
  };

  beforeEach(() => {
    loginAttemptsRepository = {
      getConsecutiveFailedCount: vi.fn(),
      getRecentFailedAttempts: vi.fn(),
      recordAttempt: vi.fn(),
    };
    authConfigService = {
      maxFailedAttempts: 5,
      lockoutBaseMinutes: 1,
    };
    lockoutService = new LockoutService(
      loginAttemptsRepository as unknown as LoginAttemptsRepository,
      authConfigService as unknown as AuthConfigService,
    );
  });

  describe('checkLockout', () => {
    it('should not lock when failures are below threshold', async () => {
      loginAttemptsRepository.getConsecutiveFailedCount.mockResolvedValue(3);

      const result = await lockoutService.checkLockout('user-1');

      expect(result.locked).toBe(false);
      expect(result.retryAfterSeconds).toBe(0);
    });

    it('should lock when failures reach threshold and within cooldown', async () => {
      loginAttemptsRepository.getConsecutiveFailedCount.mockResolvedValue(5);
      loginAttemptsRepository.getRecentFailedAttempts.mockResolvedValue(
        Array.from({ length: 5 }, () => ({
          attemptedAt: new Date(),
        })),
      );

      const result = await lockoutService.checkLockout('user-1');

      expect(result.locked).toBe(true);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
      expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
    });

    it('should not lock when cooldown has elapsed', async () => {
      loginAttemptsRepository.getConsecutiveFailedCount.mockResolvedValue(5);
      loginAttemptsRepository.getRecentFailedAttempts.mockResolvedValue([]);

      const result = await lockoutService.checkLockout('user-1');

      expect(result.locked).toBe(false);
    });

    it('should apply progressive cooldown for repeated lockouts', async () => {
      loginAttemptsRepository.getConsecutiveFailedCount.mockResolvedValue(10);
      loginAttemptsRepository.getRecentFailedAttempts.mockResolvedValue(
        Array.from({ length: 5 }, () => ({
          attemptedAt: new Date(),
        })),
      );

      const result = await lockoutService.checkLockout('user-1');

      expect(result.locked).toBe(true);
      expect(result.retryAfterSeconds).toBeGreaterThan(60);
      expect(result.retryAfterSeconds).toBeLessThanOrEqual(120);
    });

    it('should cap cooldown at 30 minutes', async () => {
      loginAttemptsRepository.getConsecutiveFailedCount.mockResolvedValue(50);
      loginAttemptsRepository.getRecentFailedAttempts.mockResolvedValue(
        Array.from({ length: 5 }, () => ({
          attemptedAt: new Date(),
        })),
      );

      const result = await lockoutService.checkLockout('user-1');

      expect(result.locked).toBe(true);
      expect(result.retryAfterSeconds).toBeLessThanOrEqual(1800);
    });
  });

  describe('recordAttempt', () => {
    it('should record a failed attempt', async () => {
      loginAttemptsRepository.recordAttempt.mockResolvedValue(undefined);

      await lockoutService.recordAttempt({
        userId: 'user-1',
        successful: false,
        ipAddress: '1.2.3.4',
        userAgent: 'Mozilla',
      });

      expect(loginAttemptsRepository.recordAttempt).toHaveBeenCalledWith({
        userId: 'user-1',
        successful: false,
        ipAddress: '1.2.3.4',
        userAgent: 'Mozilla',
      });
    });

    it('should record a successful attempt', async () => {
      loginAttemptsRepository.recordAttempt.mockResolvedValue(undefined);

      await lockoutService.recordAttempt({
        userId: 'user-1',
        successful: true,
      });

      expect(loginAttemptsRepository.recordAttempt).toHaveBeenCalledWith({
        userId: 'user-1',
        successful: true,
        ipAddress: undefined,
        userAgent: undefined,
      });
    });
  });
});
