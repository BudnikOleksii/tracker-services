import { Injectable } from '@nestjs/common';

import { AuthConfigService } from '../config/auth-config.service';
import { LoginAttemptsRepository } from './repositories/login-attempts.repository';

const MAX_LOCKOUT_MINUTES = 30;

export interface LockoutStatus {
  locked: boolean;
  retryAfterSeconds: number;
}

@Injectable()
export class LockoutService {
  constructor(
    private readonly loginAttemptsRepository: LoginAttemptsRepository,
    private readonly authConfigService: AuthConfigService,
  ) {}

  async checkLockout(userId: string): Promise<LockoutStatus> {
    const consecutiveFailures =
      await this.loginAttemptsRepository.getConsecutiveFailedCount(userId);
    const maxAttempts = this.authConfigService.maxFailedAttempts;

    if (consecutiveFailures < maxAttempts) {
      return { locked: false, retryAfterSeconds: 0 };
    }

    const lockoutTier = Math.floor(consecutiveFailures / maxAttempts);
    const cooldownMinutes = Math.min(
      this.authConfigService.lockoutBaseMinutes * Math.pow(2, lockoutTier - 1),
      MAX_LOCKOUT_MINUTES,
    );
    const cooldownMs = cooldownMinutes * 60 * 1000;

    const recentFailures =
      await this.loginAttemptsRepository.getRecentFailedAttempts(
        userId,
        new Date(Date.now() - cooldownMs),
      );

    if (recentFailures.length >= maxAttempts) {
      const lastFailure = recentFailures[0];
      if (lastFailure) {
        const unlockAt = new Date(
          lastFailure.attemptedAt.getTime() + cooldownMs,
        );
        const remainingMs = unlockAt.getTime() - Date.now();

        if (remainingMs > 0) {
          return {
            locked: true,
            retryAfterSeconds: Math.ceil(remainingMs / 1000),
          };
        }
      }
    }

    return { locked: false, retryAfterSeconds: 0 };
  }

  async recordAttempt(
    userId: string,
    successful: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.loginAttemptsRepository.recordAttempt({
      userId,
      successful,
      ipAddress,
      userAgent,
    });
  }
}
